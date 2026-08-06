/**
 * B-2 노인 등록 (C1). 성공하면:
 *   ① 홈 목록 캐시 무효화 (['care-targets'])
 *   ② FCM 권한 요청 + 토큰 등록 — 알림 권한은 앱 최초 진입이 아니라
 *      "첫 노인 등록 직후" 맥락에서 요청한다 (PRODUCT.md·StyleGuide 7절).
 *      이 훅이 registerFcmToken()의 첫 호출 지점이다.
 *   ③ 새 노인의 대시보드(C-1)로 replace — 뒤로가기로 폼에 못 돌아온다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { createCareTarget, type CareTargetCreateRequest } from '@/api/endpoints/careTargets';
import { registerFcmToken } from '@/lib/fcm';

export function useCreateCareTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CareTargetCreateRequest) => createCareTarget(body),
    onSuccess: async ({ care_target_id }) => {
      await queryClient.invalidateQueries({ queryKey: ['care-targets'] });
      // 등록 실패해도 흐름을 막지 않는다 (fcm.ts가 내부에서 삼킴)
      await registerFcmToken();
      router.replace({
        pathname: '/(app)/(tabs)/home/[id]',
        params: { id: String(care_target_id), registered: '1' },
      });
    },
  });
}
