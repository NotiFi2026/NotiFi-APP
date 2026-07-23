/**
 * Axios 인스턴스 — StyleGuide-RN.md 5절, ui-spec.md 1-10(토큰 관리) 기준.
 * Request: SecureStore의 accessToken을 Authorization 헤더에 주입.
 * Response: 401 시 A3(POST /auth/refresh)로 갱신 후 원요청 재시도. 실패 시 세션 초기화 + 로그인 이동.
 * 동시 다발 401은 큐잉해 refresh 호출이 한 번만 나가도록 한다.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { API_BASE_URL } from '@/config/env';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/secureStore';
import type { ApiResponse } from '@/shared/types/api';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

apiClient.interceptors.request.use(async (config) => {
  // 메모리(Zustand) 우선, 없으면 SecureStore.
  // 자동 로그인을 끄면 토큰을 SecureStore에 저장하지 않고, 웹에서는 SecureStore 자체가 no-op이라
  // 메모리를 먼저 보지 않으면 인증 헤더가 통째로 빠진다.
  const token = useAuthStore.getState().accessToken ?? (await getAccessToken());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: ((token: string | null) => void)[] = [];

async function handleSessionExpired(originalError: unknown) {
  await clearTokens();
  useAuthStore.getState().clearSession();
  router.replace('/(auth)/login');
  return Promise.reject(originalError);
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('NO_REFRESH_TOKEN');
      }

      const { data } = await axios.post<ApiResponse<{ access_token: string; refresh_token: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );
      if (!data.data) {
        throw new Error('REFRESH_FAILED');
      }
      const { access_token, refresh_token } = data.data;

      await setTokens(access_token, refresh_token);
      pendingQueue.forEach((resolvePending) => resolvePending(access_token));
      pendingQueue = [];

      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      pendingQueue.forEach((resolvePending) => resolvePending(null));
      pendingQueue = [];
      return handleSessionExpired(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
