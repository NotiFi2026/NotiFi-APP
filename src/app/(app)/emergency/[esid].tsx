import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useEmergencyScreenData } from '@/features/escalation/application/hooks/useEmergencyScreenData';
import { useResolveEscalation } from '@/features/escalation/application/hooks/useResolveEscalation';
import { EmergencyScreen } from '@/features/escalation/presentation/components/EmergencyScreen';

/**
 * D-4. 응급 풀스크린.
 * esid: 목데이터 키(fall/inactivity/respiration/anomaly — 발표 데모 경로) 또는
 *       실제 escalation_id (FCM 딥링크·대시보드 진입) — 실 id면 E3 resolve 연동.
 */
export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();
  const { data, isMock, isLoading, isError } = useEmergencyScreenData(esid);
  const resolveMutation = useResolveEscalation(esid ?? '');

  const handleResolve = (resolutionType: 'GUARDIAN_HANDLED' | 'FALSE_ALARM') => {
    if (isMock) {
      router.back(); // 데모 경로: 서버 호출 없이 종료
      return;
    }
    if (resolveMutation.isPending) return; // 중복 탭 방지
    resolveMutation.mutate(resolutionType);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1214' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1214', gap: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16 }}>응급 상황 정보를 불러오지 못했습니다.</Text>
        <Text onPress={() => router.back()} style={{ color: '#9CA3AF', fontSize: 14 }}>
          돌아가기
        </Text>
      </View>
    );
  }

  return (
    <EmergencyScreen
      data={data}
      onConfirmHandled={() => handleResolve('GUARDIAN_HANDLED')}
      onDismissFalseAlarm={() => handleResolve('FALSE_ALARM')}
      onViewDetail={() => router.back()}
    />
  );
}
