import { C } from '../_lib/tokens';

export type PhoneState = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error';

export function PhoneVerificationCard(props: {
  phone: string;
  code: string;
  state: PhoneState;
  message: string;
  onPhoneChange: (v: string) => void;
  onCodeChange: (v: string) => void;
  onRequest: () => void;
  onVerify: () => void;
}) {
  const busy = props.state === 'sending' || props.state === 'verifying';
  const codeBoxVisible = props.state === 'sent' || props.state === 'verifying' || !!props.code;
  return (
    <section
      className="mb-5 rounded-3xl p-5"
      style={{ background: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}` }}
    >
      <h2 className="text-lg font-bold" style={{ color: C.ink }}>
        전화번호 인증이 필요해
      </h2>
      <p className="mt-1 text-sm" style={{ color: C.muted, lineHeight: 1.6 }}>
        구매 내역과 매칭 카드는 가입 계정과 전화번호가 연결돼야 보여.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <input
          value={props.phone}
          onChange={(e) => props.onPhoneChange(e.target.value)}
          placeholder="01012345678"
          inputMode="tel"
          className="w-full px-4 py-3 rounded-2xl text-base font-medium outline-none"
          style={{ color: C.ink, background: '#FFFFFF', border: `2px solid ${C.ink}` }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={props.onRequest}
          className="w-full px-5 py-3 rounded-full font-bold text-sm disabled:opacity-40"
          style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
        >
          {props.state === 'sending' ? '발송 중…' : '인증번호 받기'}
        </button>
        {codeBoxVisible && (
          <div className="flex gap-2">
            <input
              value={props.code}
              onChange={(e) => props.onCodeChange(e.target.value)}
              placeholder="인증번호"
              inputMode="numeric"
              className="min-w-0 flex-1 px-4 py-3 rounded-2xl text-base font-medium outline-none"
              style={{ color: C.ink, background: '#FFFFFF', border: `2px solid ${C.ink}` }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={props.onVerify}
              className="px-4 py-3 rounded-full font-bold text-sm disabled:opacity-40"
              style={{ background: C.accent, color: '#FFFFFF', border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}` }}
            >
              확인
            </button>
          </div>
        )}
        {props.message && (
          <p className="text-xs" style={{ color: props.state === 'error' ? C.bad : C.ok }}>
            {props.message}
          </p>
        )}
      </div>
    </section>
  );
}
