/**
 * 로그인 세션 전역 상태 — StyleGuide-RN.md 4절(Global State: Zustand).
 * accessToken은 여기(메모리)와 SecureStore 양쪽에 보관한다 (ui-spec.md 1-10).
 */

import { create } from 'zustand';

/**
 * 서버 Role enum 전체 (user/entity/Role.java).
 * 앱이 아는 것보다 서버가 더 많은 값을 줄 수 있으면 가드가 조용히 틀린다 —
 * 특히 CARE_RECIPIENT는 보호자 화면이 아예 성립하지 않는 역할이라 반드시 구분해야 한다.
 */
export type Role = 'GUARDIAN' | 'SOCIAL_WORKER' | 'ADMIN' | 'CARE_RECIPIENT';

/**
 * A1 회원가입 폼에서 고를 수 있는 역할.
 * Role을 그대로 쓰면 안 된다 — 노인 계정은 연결코드(A5)로만 만들어지고 ADMIN은 앱이 만들 것이 아니다.
 */
export type SignupRole = Extract<Role, 'GUARDIAN' | 'SOCIAL_WORKER'>;

export interface SessionUser {
  user_id: number;
  name: string;
  role: Role;
  /**
   * 노인 계정 전용 — A5 응답의 care_target_id.
   * 노인은 care_relationship 행이 없어 C2(노인 목록)가 빈 배열을 준다. 자기 상태를 볼 유일한
   * 열쇠라서 세션과 함께 저장한다 (SecureStore, lib/secureStore.ts).
   */
  care_target_id?: number;
}

/**
 * 인증 확정 여부.
 *
 * <p>불리언 하나로 두면 안 된다 — 앱이 막 켜진 순간에는 SecureStore를 아직 못 읽어
 * accessToken이 null이고, 그걸 "로그아웃"으로 읽으면 <b>유효한 세션도 로그인 화면으로 튕긴다.</b>
 * 응급 푸시를 타고 들어온 상황에서 이게 터지면 사용자는 사고 화면 대신 로그인을 본다.
 * 'restoring'은 "아직 모른다"를 표현하기 위한 상태다.
 */
export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  user: SessionUser | null;
  setSession: (accessToken: string, user: SessionUser) => void;
  /** 복원 실패·세션 만료 — 저장된 것이 없다고 확정한다 */
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'restoring',
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ status: 'authenticated', accessToken, user }),
  clearSession: () => set({ status: 'unauthenticated', accessToken: null, user: null }),
}));

/** 역할별 착지 지점 — 가드 네 곳이 같은 판단을 쓰도록 한 군데 둔다 */
export function homeRouteFor(user: SessionUser | null) {
  return user?.role === 'CARE_RECIPIENT' ? '/(recipient)' : '/(app)/(tabs)/home';
}
