'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  castingFetchUser,
  clearCastingUserSession,
  getCastingUserToken,
} from '@/lib/casting/api';

interface MeResponse {
  user_uid: string;
  email: string;
  phone: string | null;
  last_login_at: string;
  created_at: string;
}

export default function MePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unauth'>('loading');

  useEffect(() => {
    if (!getCastingUserToken()) {
      setStatus('unauth');
      return;
    }
    castingFetchUser<MeResponse>('/casting/auth/me')
      .then((data) => {
        setMe(data);
        setStatus('ready');
      })
      .catch((err: Error) => {
        const msg = err.message || '';
        if (msg.includes('401') || msg.includes('403')) {
          clearCastingUserSession();
          setStatus('unauth');
        } else {
          setStatus('unauth');
        }
      });
  }, []);

  if (status === 'unauth') {
    router.replace('/casting/auth/login');
    return null;
  }

  if (status === 'loading' || !me) {
    return (
      <main className="max-w-[480px] mx-auto min-h-screen flex items-center justify-center bg-[#F5EFE4]">
        <p className="text-[#4A443B] text-[15px]">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="max-w-[480px] mx-auto min-h-screen bg-[#F5EFE4] px-6 pt-12 pb-16">
      <div className="text-center mb-7">
        <div className="inline-flex w-14 h-14 rounded-full bg-[#F1CE63] text-[#1C1A17]
                        items-center justify-center text-[26px] font-extrabold
                        border-[2px] border-[#1C1A17] shadow-[3px_4px_0_#1C1A17] mb-4">
          ✓
        </div>
        <h1 className="font-bold text-[22px] text-[#1C1A17] mb-2">가입 완료!</h1>
        <p className="text-[#4A443B] text-[15px] leading-[1.6]">
          의뢰인님께 딱 맞는<br />
          매칭 카드를 찾고 있어요.
        </p>
        <p className="text-[#8A8275] text-[12.5px] mt-2">{me.email}</p>
      </div>

      <div className="mx-auto max-w-[320px] bg-[#1C1A17] rounded-[32px] p-[6px] shadow-[0_18px_40px_rgba(28,26,23,0.18)]">
        <div className="bg-white rounded-[26px] overflow-hidden">
          <div className="px-5 pt-2.5 pb-1.5 text-[11px] text-[#1C1A17] font-semibold flex justify-between">
            <span>9:41</span>
            <span>●●● 100%</span>
          </div>
          <div className="px-4 pb-3 pt-1 border-b border-black/5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E37A3A] flex items-center justify-center text-white text-[15px]">
              💌
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-[13px] text-[#1C1A17]">캐스팅</div>
              <div className="text-[10px] text-[#8A8275] tabular-nums">070-7694-7070</div>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-[#EFEDEB] rounded-[18px] rounded-bl-[6px] px-4 py-3 text-[13px] leading-[1.7] text-[#1C1A17] text-left whitespace-pre-line">
{`[캐스팅] 당신의 캐스티를 소개합니다 🌏
[Web발신]
당신이 원하던 그 사람은
소개팅 앱에 없어요 👀

지난 번 제출해주신 답변을 바탕으로
의뢰인님께 딱 맞는 상대를
찾아왔답니다

지금 바로 당신의 캐스티를 소개합니다!
상대방 카드 확인하기:
https://casting.publicvoid.im/...`}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[320px] mt-5 bg-[#EDE5D2] border border-[#1C1A17]/10 rounded-[14px] p-4 text-center">
        <p className="text-[13px] text-[#1C1A17] leading-[1.65]">
          📨 <b>2~3일 안</b>에 위와 같은 문자가 도착해요.
          <br />
          <span className="text-[#4A443B]">스팸함도 꼭 확인해주세요!</span>
        </p>
      </div>

      <p className="mt-6 text-center text-[12px] text-[#8A8275]">
        문의: <a href="mailto:hello@livehivecorp.com" className="font-semibold text-[#4A443B] underline">hello@livehivecorp.com</a>
      </p>
    </main>
  );
}
