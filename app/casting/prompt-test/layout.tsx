// 운영 환경에서는 ENABLE_PROMPT_TEST=1 일 때만 페이지 노출.
// 같은 가드를 /api/casting/prompt-test 라우트에도 둠.
// 이유: 인증·레이트리밋 부재 상태에서 외부 노출 시 LLM 비용 위험.

import { notFound } from 'next/navigation';

export default function CastingPromptTestLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PROMPT_TEST !== '1') {
    notFound();
  }
  return <>{children}</>;
}
