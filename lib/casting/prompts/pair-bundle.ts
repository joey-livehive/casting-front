// Prompt 2: PAIR BUNDLE — 매칭마다 1회 호출.
// docs/casting-template/prompts/pair-bundle.md 와 sync.

import type { PairBundleInput, PairBundleOutput } from './types';
import { PairBundleSchema } from './schemas';
import { DEFAULT_PAIR_SYSTEM_PROMPT } from './system-prompts';
import { callLLM, detectProvider, extractJsonObject } from './llm-client';

export async function generatePairBundle(
  input: PairBundleInput,
  opts?: { model?: string; systemPrompt?: string }
): Promise<{ output: PairBundleOutput; raw: string; latencyMs: number; model: string }> {
  if (detectProvider() === 'mock') {
    return mockPairBundle(input);
  }

  const systemPrompt = opts?.systemPrompt?.trim() || DEFAULT_PAIR_SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(input);

  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const { raw, latencyMs, model } = await callLLM({
      systemPrompt:
        attempt === 0
          ? systemPrompt
          : `${systemPrompt}\n\n## 이전 시도 실패 — 다음 규칙 반드시 지켜라\n${lastError}`,
      userPrompt,
      model: opts?.model,
    });
    try {
      const parsed = extractJsonObject(raw);
      const result = PairBundleSchema.safeParse(parsed);
      if (result.success) {
        return { output: result.data, raw, latencyMs, model };
      }
      lastError = result.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
      if (attempt === 1) {
        throw new Error(`PairBundle 검증 실패 (재시도 후) — ${lastError}\n\nraw: ${raw.slice(0, 500)}`);
      }
    } catch (e) {
      if (attempt === 1) throw e;
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error('PairBundle: unreachable');
}

function buildUserPrompt(input: PairBundleInput): string {
  const lines: string[] = [];
  lines.push('## 의뢰인(viewer) 답변');
  for (const [q, a] of Object.entries(input.viewer.answers)) {
    lines.push(`- ${q}: ${a}`);
  }
  lines.push('');
  lines.push('## 매칭 상대(candidate) 답변');
  for (const [q, a] of Object.entries(input.candidate.answers)) {
    lines.push(`- ${q}: ${a}`);
  }
  lines.push('');
  lines.push('## 백엔드가 골라준 매칭 축 4개');
  for (const m of input.matchedAxes) {
    lines.push(
      `- axis="${m.axis}" type="${m.type}" viewer="${m.viewerAnswer}" candidate="${m.candidateAnswer}"`
    );
  }
  lines.push('');
  lines.push('아래 JSON 스키마를 채워 정확히 출력해 줘. 다른 키 이름 사용 금지.');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "chapter3Notes": [');
  lines.push('    { "axis": "...", "narrative": "..." },');
  lines.push('    { "axis": "...", "narrative": "..." },');
  lines.push('    { "axis": "...", "narrative": "..." },');
  lines.push('    { "axis": "...", "narrative": "..." }');
  lines.push('  ],');
  lines.push('  "chapter3Simulation": "..."');
  lines.push('}');
  lines.push('```');
  lines.push('');
  lines.push('각 객체의 키는 정확히 "axis" 와 "narrative" — "note" 같은 다른 이름 절대 금지.');
  return lines.join('\n');
}

function mockPairBundle(input: PairBundleInput) {
  const padded = input.matchedAxes.slice(0, 4);
  while (padded.length < 4) {
    padded.push({ axis: '추가 축', viewerAnswer: '-', candidateAnswer: '-', type: 'match' });
  }
  const notes = padded.map((m) => ({
    axis: m.axis,
    narrative: `[MOCK] 의뢰인님이 <b>"${m.viewerAnswer}"</b> 라고 답하셨고, 이 분도 같은 답을 골랐어요. ${m.axis} 축에서 자연스럽게 맞아떨어지는 사이예요. 관계가 깊어질수록 같은 방향으로 천천히 갈 수 있는 분이라, 일상에서 부딪힐 일이 적은 호흡이에요.`,
  }));
  return {
    output: {
      chapter3Notes: notes,
      chapter3Simulation:
        '[MOCK] 첫 만남은 <b>조용한 카페</b>가 어울릴 거예요. 두 분 다 차분한 자리에서 천천히 시작하는 걸 좋아하시니까, 자리만 잡으시면 시간 가는 줄 모르실 거예요. 같은 도시에 사시니 동선도 자연스럽게 풀려요. 이 분이 평소 어떻게 말하는 분일지 가늠해보면, 첫 만남에서 이렇게 말할 것 같아요. "오시는 길 안 막혔어요? 저는 좀 일찍 와서 자리 잡고 있었어요." 큰 이벤트 없이도 작은 디테일을 챙기는 분이라, 첫 대화부터 편안한 거리감이 만들어질 거예요. [set API KEY for real generation]',
    } satisfies PairBundleOutput,
    raw: '[mock]',
    latencyMs: 0,
    model: 'mock',
  };
}
