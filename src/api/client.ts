/**
 * Axios 인스턴스 — StyleGuide-RN.md 5절, ui-spec.md 1-10(토큰 관리) 기준.
 * Request: SecureStore의 accessToken을 Authorization 헤더에 주입.
 * Response: 401 시 A3(POST /auth/refresh)로 갱신 후 원요청 재시도. 실패 시 세션 초기화(이동은 가드가 한다).
 * 단 인증 없이 부르는 `/auth/*`의 401은 갱신 대상이 아니다 — isPublicAuthEndpoint 주석 참고.
 * 동시 다발 401은 큐잉해 refresh 호출이 한 번만 나가도록 한다.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

/**
 * **인증 없이 부르는** auth 엔드포인트(로그인·회원가입·연결코드 가입)의 401은
 * "세션이 만료됐다"가 아니라 **그 요청 자체의 답**이다. 갱신을 시도하면 로그아웃 상태라
 * 리프레시 토큰이 없어 NO_REFRESH_TOKEN으로 에러가 바뀌고, 원래 코드(INVALID_CREDENTIALS)가
 * 사라져 로그인 화면이 "비밀번호가 틀렸다" 대신 "서버에 문제가 있습니다"를 띄운다.
 *
 * **`/auth/logout`은 제외한다.** 서버 SecurityConfig가 auth 중 유일하게 `authenticated()`로
 * 둔 엔드포인트다 — 액세스 토큰이 만료됐으면 갱신 후 재시도해야 서버의 리프레시 토큰이
 * 실제로 폐기된다. 여기까지 걸러버리면 로컬만 로그아웃되고 서버 토큰은 TTL까지 살아남는다.
 */
function isPublicAuthEndpoint(url: string | undefined): boolean {
  const path = url ?? '';
  return path.startsWith('/auth/') && !path.startsWith('/auth/logout');
}

/**
 * 세션이 끝났다고 확정한다. **화면은 옮기지 않는다** — clearSession이 status를
 * 'unauthenticated'로 바꾸면 각 그룹 레이아웃 가드가 알아서 로그인으로 보낸다.
 *
 * 리액트 밖(인터셉터)에서 router를 부르면 마운트 전이거나 다른 네비게이션과 겹칠 때
 * 조용히 무시되거나 서로를 덮어썼다. 판단을 한 곳(가드)에만 두면 그 경합이 사라진다.
 */
async function handleSessionExpired(originalError: unknown) {
  await clearTokens();
  useAuthStore.getState().clearSession();
  return Promise.reject(originalError);
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthEndpoint(originalRequest.url)
    ) {
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
      if (!data.success || !data.data) {
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
