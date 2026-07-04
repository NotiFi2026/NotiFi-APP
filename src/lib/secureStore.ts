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

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

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
}
