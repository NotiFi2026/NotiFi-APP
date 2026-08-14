/**
 * R1-c 미리보기 · R1-b 수락 — 초대 코드로 다른 보호자의 노인에 합류한다.
 *
 * 미리보기와 수락을 나눈 건 화면 단계 때문만이 아니다. 남의 노인 정보에 접근하는 결정이라
 * **누가 누구를 맡기려는지 보고 수락해야** 한다. 서버가 R1-c를 코드 소모 없이 열어둔 이유다.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { acceptInviteCode, previewInviteCode } from '@/api/endpoints/guardians';

/**
 * 코드가 확정됐을 때만 조회한다. `enabled`가 false인 동안 react-query는 `isPending`을
 * 계속 true로 두므로, 호출부는 로딩 판정에 `isPending` 대신 `isFetching`이나
 * `enabled` 조건을 함께 봐야 한다 — 이 앱에서 이미 두 번 밟은 함정이다.
 */
export function useInvitePreview(code: string | null) {
  return useQuery({
    queryKey: ['invite-preview', code],
    queryFn: () => previewInviteCode(code as string),
    enabled: code !== null,
    // 초대는 한 번 확인하면 끝이다. 재시도가 붙으면 잘못된 코드에서 오류가 늦게 뜬다
    retry: false,
  });
}

export function useInviteAccept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => acceptInviteCode(code),
    /**
     * 합류하면 홈 목록에 그 노인이 새로 나타나야 한다.
     *
     * **await가 핵심이다.** 대시보드는 이름을 C2 캐시에서 구독 없이 읽어서
     * (DashboardView: 폴링 관찰자를 늘리지 않으려는 의도적 선택), 캐시가 차기 전에
     * 이동하면 이름 자리가 "돌보시는 분"으로 굳는다 — 실서버 관통에서 실제로 봤다.
     * 여기서 기다리면 호출부의 onSuccess(=화면 이동)가 목록이 채워진 뒤에 실행된다.
     */
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['care-targets'] }),
  });
}
