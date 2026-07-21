import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { useEmergencyScreenData } from '@/features/escalation/application/hooks/useEmergencyScreenData';
import { EmergencyScreen } from '@/features/escalation/presentation/components/EmergencyScreen';

/**
 * D-4. 응급 풀스크린.
 * esid: 목데이터 키(fall/inactivity/respiration/anomaly — 발표 데모 경로) 또는
 *       실제 escalation_id (FCM 딥링크·대시보드 진입).
 */
export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();
  const { data, isLoading, isError } = useEmergencyScreenData(esid);

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
      onConfirmHandled={() => router.back()}
      onDismissFalseAlarm={() => router.back()}
      onViewDetail={() => router.back()}
    />
  );
}
