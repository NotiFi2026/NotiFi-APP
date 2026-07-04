/**
 * 로그인 세션 전역 상태 — StyleGuide-RN.md 4절(Global State: Zustand).
 * accessToken은 여기(메모리)와 SecureStore 양쪽에 보관한다 (ui-spec.md 1-10).
 */

import { create } from 'zustand';

export interface SessionUser {
  user_id: number;
  name: string;
  role: 'GUARDIAN' | 'SOCIAL_WORKER';
}

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  setSession: (accessToken: string, user: SessionUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
