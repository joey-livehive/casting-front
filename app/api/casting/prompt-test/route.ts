import { NextResponse } from 'next/server';
import { generatePersonBundle } from '@/lib/casting/prompts/person-bundle';
import { generatePairBundle } from '@/lib/casting/prompts/pair-bundle';
import type { PersonBundleInput, PairBundleInput } from '@/lib/casting/prompts/types';

export const runtime = 'nodejs';

// 운영 환경에서는 ENABLE_PROMPT_TEST=1 일 때만 라우트 노출.
// 가드 이유: 인증·레이트리밋 부재 상태에서 누구나 LLM 호출 가능 → API 키 비용 노출 위험.
function isEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_PROMPT_TEST === '1';
}

export async function POST(req: Request) {
  if (!isEnabled()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  try {
    const body = await req.json();
    const mode = body.mode as 'person' | 'pair';

    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : undefined;

    if (mode === 'person') {
      const input = body.input as PersonBundleInput;
      const result = await generatePersonBundle(input, { systemPrompt });
      return NextResponse.json({ ok: true, mode, ...result });
    }
    if (mode === 'pair') {
      const input = body.input as PairBundleInput;
      const result = await generatePairBundle(input, { systemPrompt });
      return NextResponse.json({ ok: true, mode, ...result });
    }
    return NextResponse.json({ ok: false, error: 'unknown mode' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
