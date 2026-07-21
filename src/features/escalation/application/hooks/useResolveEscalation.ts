/**
 * E3 보호자 확인·해제 mutation.
 * 성공 시 상세 캐시를 갱신하고 화면을 닫는다.
 * 409(ESCALATION_ALREADY_RESOLVED)는 이미 다른 경로로 종료된 경우 — 안내 후 닫는다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { resolveEscalation } from '@/api/endpoints/escalations';

export function useResolveEscalation(esid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resolutionType: 'GUARDIAN_HANDLED' | 'FALSE_ALARM') =>
      resolveEscalation(esid, { resolution_type: resolutionType }),
    onSuccess: (detail) => {
      queryClient.setQueryData(['escalation', esid], detail);
      router.back();
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['escalation', esid] });
        Alert.alert('이미 처리됨', '이 응급 상황은 이미 해제되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
        return;
      }
      Alert.alert('처리 실패', '네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    },
  });
}
