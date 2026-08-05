/**
 * 화면 재진입 시 서버 상태를 즉시 1회 갱신한다 (StyleGuide-RN.md 4절).
 * 웹의 refetchOnWindowFocus 대응물 — RN에서는 포커스 이벤트가 네비게이터에서 온다.
 * 첫 마운트는 건너뛴다: useQuery가 마운트 시점 fetch를 이미 담당한다.
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

export function useRefreshOnFocus(refetch: () => void) {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );
}
