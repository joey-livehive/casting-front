// 인스타 매칭 LLM 프롬프트 테스트 라우트.
// 백엔드를 거치지 않고 llm-client.ts 직접 호출 → InstaContent 반환.
//
// gating: NODE_ENV !== 'production' 이거나 ENABLE_PROMPT_TEST=1 일 때만 응답.
// 이미지: candidate.photoUrls[0] 만 1차 vision 입력으로 사용.

import { NextResponse } from 'next/server';
import { callLLM, extractJsonObject, detectProvider } from '@/lib/casting/prompts/llm-client';
import { InstaContentSchema } from '@/lib/casting/insta/schema';
import { DEFAULT_INSTA_SYSTEM_PROMPT } from '@/lib/casting/insta/system-prompt';
import type { InstaCandidateInput, InstaContentInput } from '@/lib/casting/insta/types';

export const runtime = 'nodejs';

interface RequestBody {
  /** Optional override; default = DEFAULT_INSTA_SYSTEM_PROMPT */
  systemPrompt?: string;
  input: InstaContentInput;
  model?: string;
}

function isEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_PROMPT_TEST === '1';
}

function buildUserPrompt(input: InstaContentInput): string {
  const { viewer, candidate } = input;
  const lines: string[] = [];
  lines.push('# 의뢰인 설문 응답 (CastingAnswers)');
  lines.push('```json');
  lines.push(JSON.stringify(viewer.answers, null, 2));
  lines.push('```');
  lines.push('');

  // 정규화 LLM 출력 (있으면 그걸 우선 dump — 새 prompt 가 이 형태를 기대)
  const c = candidate as InstaCandidateInput & {
    structured?: unknown;
    confidence?: unknown;
    trait_axes?: unknown;
    self_text?: string;
    atmosphere_tags?: string[];
    reviewer_summary?: string;
  };
  const hasNormalized = c.structured || c.trait_axes || c.self_text || c.atmosphere_tags || c.reviewer_summary;
  if (hasNormalized) {
    lines.push('# 인스타그램 후보 — 사전 분석 (정규화 LLM 출력)');
    lines.push('```json');
    lines.push(JSON.stringify({
      structured: c.structured,
      confidence: c.confidence,
      trait_axes: c.trait_axes,
      self_text: c.self_text,
      atmosphere_tags: c.atmosphere_tags,
      reviewer_summary: c.reviewer_summary,
    }, null, 2));
    lines.push('```');
    lines.push('');
  }

  lines.push('# 인스타그램 후보 raw 데이터');
  if (candidate.handle) lines.push(`handle: @${candidate.handle}`);
  if (candidate.bio) {
    lines.push('## bio');
    lines.push(candidate.bio);
  }
  if (candidate.samplePosts.length > 0) {
    lines.push('## 캡션 샘플');
    candidate.samplePosts.forEach((p, i) => lines.push(`- (post ${i + 1}) ${p}`));
  }
  if (candidate.hints) {
    lines.push('## 운영자 hints');
    if (candidate.hints.likelyAgeRange) lines.push(`- likelyAgeRange: ${candidate.hints.likelyAgeRange}`);
    if (candidate.hints.likelyOccupation) lines.push(`- likelyOccupation: ${candidate.hints.likelyOccupation}`);
    if (candidate.hints.location) lines.push(`- location: ${candidate.hints.location}`);
  }
  if (candidate.photoUrls.length > 0) {
    lines.push('## 사진');
    lines.push(`첫 사진은 vision 입력으로 별도 첨부됨. 추가 URL: ${candidate.photoUrls.slice(1).join(', ') || '없음'}`);
  }
  lines.push('');
  lines.push('스키마에 맞는 JSON 한 객체만 출력해.');
  return lines.join('\n');
}

export async function POST(req: Request) {
  if (!isEnabled()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }
  if (!body?.input?.viewer?.answers || !body?.input?.candidate) {
    return NextResponse.json(
      { ok: false, error: 'input.viewer.answers and input.candidate are required' },
      { status: 400 },
    );
  }

  const provider = detectProvider();
  if (provider === 'mock') {
    return NextResponse.json(
      {
        ok: false,
        error:
          'No LLM provider key configured. Set GOOGLE_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY in .env.local and restart.',
        provider,
      },
      { status: 503 },
    );
  }

  const systemPrompt = body.systemPrompt || DEFAULT_INSTA_SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(body.input);
  const photoUrl = body.input.candidate.photoUrls[0];

  try {
    const llm = await callLLM({
      systemPrompt,
      userPrompt,
      photoUrl,
      model: body.model,
    });
    let parsed: unknown;
    try {
      parsed = extractJsonObject(llm.raw);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { ok: false, error: `JSON 파싱 실패: ${msg}`, raw: llm.raw, meta: llm },
        { status: 502 },
      );
    }

    const validated = InstaContentSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'schema validation failed',
          issues: validated.error.issues,
          raw: parsed,
          meta: llm,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      content: validated.data,
      meta: { latencyMs: llm.latencyMs, model: llm.model, provider: llm.provider },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
