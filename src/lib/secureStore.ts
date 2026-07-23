/**
 * JWT 토큰의 영구 저장소 — ui-spec.md 1-10(토큰 관리) 기준.
 * accessToken은 Zustand(메모리)에도 보관하지만, 앱 재시작 시 복구를 위해 여기에도 저장한다.
 * AsyncStorage에 토큰 저장 금지 (StyleGuide-RN.md 7절).
 *
 * expo-secure-store는 web을 지원하지 않는다(네이티브 Keychain/Keystore 전용).
 * 이 프로덕트는 모바일 전용(CLAUDE.md)이라 web은 정식 타깃이 아니므로,
 * web에서는 세션 없음으로 취급(no-op)해 크래시만 막는다.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { SessionUser } from '@/features/auth/application/store/authStore';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_USER_KEY = 'sessionUser';

const isWeb = Platform.OS === 'web';

export async function getAccessToken(): Promise<string | null> {
  if (isWeb) return null;
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  if (isWeb) return null;
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (isWeb) return;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  if (isWeb) return;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(SESSION_USER_KEY);
}

/**
 * 로그인 사용자 정보도 함께 보관한다.
 * A3 토큰 갱신 응답에는 user가 없고 api-spec에 /me 조회가 없어서,
 * 스플래시(A-1)에서 세션을 복원할 때 이름·역할을 되살릴 방법이 이것뿐이다.
 */
export async function setSessionUser(user: SessionUser): Promise<void> {
  if (isWeb) return;
  await SecureStore.setItemAsync(SESSION_USER_KEY, JSON.stringify(user));
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isWeb) return null;
  const raw = await SecureStore.getItemAsync(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
