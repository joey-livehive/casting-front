import { C } from '../_lib/tokens';

export function EmptyMatchesState({ phoneVerified }: { phoneVerified: boolean }) {
  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <p className="font-bold text-base" style={{ color: C.ink }}>
        매칭 카드를 준비하고 있어요
      </p>
      <p className="mt-2 text-sm" style={{ color: C.muted }}>
        {phoneVerified
          ? '캐스터가 의뢰인님에게 어울리는 사람을 찾고 있어. 카드가 도착하면 여기에 표시돼.'
          : '전화번호 인증 후 기존 매칭 내역을 찾아올게요.'}
      </p>
    </div>
  );
}
