'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { castingFetch, setCastingUserSession } from '@/lib/casting/api';

type Mode = 'password' | 'magic';
type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg('이메일을 정확히 입력해주세요.');
      setStatus('error');
      return;
    }
    if (mode === 'password' && password.length < 8) {
      setErrorMsg('비밀번호는 8자 이상이에요.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');

    try {
      if (mode === 'password') {
        const data = await castingFetch<{ user_uid: string; auth_token: string }>(
          '/casting/auth/login',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email, password }),
          },
        );
        setCastingUserSession(data.user_uid, data.auth_token);
        router.replace('/casting/me');
        return;
      }
      // magic link mode (비번 모름 / 비번 미설정 회원)
      await castingFetch('/casting/auth/magic-link/request', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });
      setStatus('sent');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('401')) {
        setErrorMsg('이메일/비밀번호를 확인해 주세요.');
      } else if (msg.includes('429')) {
        setErrorMsg('잠시 후 다시 시도해 주세요. (1분 제한)');
      } else if (msg.includes('422')) {
        setErrorMsg('형식을 확인해 주세요.');
      } else if (msg.includes('502')) {
        setErrorMsg('이메일 발송에 실패했어요. 잠시 후 다시 시도해 주세요.');
      } else {
        setErrorMsg('로그인에 실패했어요.');
      }
      setStatus('error');
    }
  };

  return (
    <main className="max-w-[480px] mx-auto min-h-screen bg-[#F5EFE4] px-6 pt-12 pb-16">
      <h1 className="font-bold text-[22px] text-[#1C1A17] mb-2">로그인</h1>
      <p className="text-[#4A443B] text-[14px] leading-[1.6] mb-6">
        가입 시 입력한 이메일·비밀번호로 로그인해주세요.
      </p>

      {status === 'sent' ? (
        <div className="bg-white rounded-[14px] p-5 border border-[#1C1A17]/10 text-center">
          <div className="text-[36px] mb-3">📨</div>
          <p className="text-[#1C1A17] text-[15px] leading-[1.6] mb-1">
            <b>{email}</b>로 로그인 링크를 보냈어요.
          </p>
          <p className="text-[#8A8275] text-[13px] mt-3">
            메일이 안 보이면 스팸함도 확인해주세요. 24시간 후 자동 만료됩니다.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
          />
          {mode === 'password' && (
            <input
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full h-12 px-4 rounded-[12px] bg-white border border-[#1C1A17]/15 text-[15px] text-[#1C1A17] placeholder:text-[#8A8275]"
            />
          )}
          {status === 'error' && errorMsg && (
            <p className="text-red-600 text-[13px]">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full h-12 rounded-full bg-[#E37A3A] text-white font-display font-bold disabled:opacity-50"
          >
            {status === 'sending'
              ? mode === 'password' ? '로그인 중...' : '발송 중...'
              : mode === 'password' ? '로그인' : '로그인 링크 받기'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'password' ? 'magic' : 'password'));
              setErrorMsg('');
              setStatus('idle');
            }}
            className="w-full text-center text-[12.5px] text-[#4A443B] underline pt-2"
          >
            {mode === 'password'
              ? '비밀번호를 모르세요? 매직링크로 로그인'
              : '비밀번호로 로그인'}
          </button>
        </form>
      )}
    </main>
  );
}
