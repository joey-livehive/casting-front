// Prompt 1: PERSON BUNDLE — candidateBundle + viewerBundle 통합 1회 호출.
// docs/casting-template/prompts/person-bundle.md 와 sync.

import type { PersonBundleInput, PersonBundleOutput } from './types';
import { PersonBundleSchema } from './schemas';
import { DEFAULT_PERSON_SYSTEM_PROMPT } from './system-prompts';
import { callLLM, detectProvider, extractJsonObject } from './llm-client';

export async function generatePersonBundle(
  input: PersonBundleInput,
  opts?: { model?: string; systemPrompt?: string }
): Promise<{ output: PersonBundleOutput; raw: string; latencyMs: number; model: string }> {
  if (detectProvider() === 'mock') {
    return mockPersonBundle(input);
  }

  const systemPrompt = opts?.systemPrompt?.trim() || DEFAULT_PERSON_SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(input);

  // Zod 실패 시 1회 retry (모델이 키 이름·강조 룰 어긋났을 때 다시 시도하면 잘 맞춤)
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const { raw, latencyMs, model } = await callLLM({
      systemPrompt:
        attempt === 0
          ? systemPrompt
          : `${systemPrompt}\n\n## 이전 시도 실패 — 다음 규칙 반드시 지켜라\n${lastError}`,
      userPrompt,
      photoUrl: input.photoUrl,
      model: opts?.model,
    });

    try {
      const parsed = extractJsonObject(raw);
      const result = PersonBundleSchema.safeParse(parsed);
      if (result.success) {
        return { output: result.data, raw, latencyMs, model };
      }
      lastError = result.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
      if (attempt === 1) {
        throw new Error(`PersonBundle 검증 실패 (재시도 후) — ${lastError}\n\nraw: ${raw.slice(0, 500)}`);
      }
    } catch (e) {
      if (attempt === 1) throw e;
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error('PersonBundle: unreachable');
}

function buildUserPrompt(input: PersonBundleInput): string {
  const lines: string[] = [];
  lines.push('## 입력: 한 사용자의 설문 답변');
  lines.push('');
  for (const [q, a] of Object.entries(input.answers)) {
    lines.push(`- Q: ${q}\n  A: ${a}`);
  }
  if (input.photoUrl) {
    lines.push('');
    lines.push('## 사진');
    lines.push('[Vision 입력으로 사진 첨부됨]');
    lines.push('- 사진 분석 가이드를 따라 candidateBundle 슬롯에 인상 반영');
    lines.push('- viewerBundle 에는 사진 정보 반영 금지');
  }
  lines.push('');
  lines.push('아래 JSON 스키마를 정확히 채워 출력해 줘. 키 이름·구조 변경 금지.');
  lines.push('');
  lines.push('```json');
  lines.push('{');
  lines.push('  "candidateBundle": {');
  lines.push('    "casterHeadline": "...",');
  lines.push('    "casterCharmBullets": ["...", "...", "..."],');
  lines.push('    "teaserFaceType": "...",');
  lines.push('    "chapter2Personality": "...",');
  lines.push('    "chapter2DatingStyle": "...",');
  lines.push('    "chapter2WeekendStyle": "...",');
  lines.push('    "readingMatchOpening": "...",');
  lines.push('    "readingCandidateMatch": "..."');
  lines.push('  },');
  lines.push('  "viewerBundle": {');
  lines.push('    "readingViewerInsight": "..."');
  lines.push('  }');
  lines.push('}');
  lines.push('```');
  return lines.join('\n');
}

// API key 없을 때 동작 확인용 mock — Zod 검증 통과하는 최소 카피.
function mockPersonBundle(input: PersonBundleInput) {
  const mbti = input.answers['MBTI 뭐야?'] ?? '???';
  const free = input.answers['나한테 하고 싶은 말'] ?? '';
  const freePreview = free.slice(0, 30) || '진지한 연애';
  const long = (label: string) =>
    `[MOCK ${label}] 본인을 소개하실 때 "${freePreview}" 라고 하셨는데, 이 표현에서 의뢰인님이 어떤 분인지 보여요. ${mbti} 답게 자기만의 페이스를 챙기시는 분이라, 작은 디테일에 진심을 담으시는 모습이 보여요. 큰 이벤트보다는 일상의 안부로 마음을 표현하는 사람과 잘 어울리실 것 같아요. 의뢰인님 자신도 그렇게 사람을 챙기실 분이라, 시간이 갈수록 따뜻함이 쌓이는 관계를 만드실 수 있어요.`;
  const longCandidate = (label: string) =>
    `[MOCK ${label}] 이 사람은 비흡연에 차분한 라이프를 가진 분이에요. ${mbti} 답게 자기 일에 묵묵히 몰입하는 타입이라, 약속한 건 빠뜨리지 않고 사소한 메시지도 놓치지 않는 분이에요. 처음에는 조용해 보여도 같이 시간을 보낼수록 깊이가 보이는 사람이라, 알아갈수록 더 좋아하실 분이에요. 매일의 안부와 작은 챙김으로 옆자리를 따뜻하게 채우는 타입이에요.`;
  return {
    output: {
      candidateBundle: {
        casterHeadline: '비흡연·차분한 라이프, 매일 챙겨줄 사람',
        casterCharmBullets: [
          '<b>매일 꾸준히 연락</b>하고 옆에 있어주는 다정한 타입',
          '<b>비흡연·저음주</b> 라이프, 차분하게 자기 페이스 챙기는 사람',
          '<b>옷핏 좋은 체형</b>에 단정하고 깔끔한 분위기',
        ] as [string, string, string],
        teaserFaceType: '단정하고 깔끔한 분위기',
        chapter2Personality: longCandidate('성격'),
        chapter2DatingStyle: longCandidate('연애 스타일'),
        chapter2WeekendStyle: longCandidate('주말'),
        readingMatchOpening:
          '[MOCK] 그래서 이 분이 잘 어울릴 것 같아요. 이 사람은 비흡연에 차분한 라이프를 가진 분이라, 일상의 작은 디테일을 자연스럽게 챙길 수 있는 분이에요.',
        readingCandidateMatch: longCandidate('인물평'),
      },
      viewerBundle: {
        readingViewerInsight: long('인격 분석'),
      },
    } satisfies PersonBundleOutput,
    raw: '[mock — set GOOGLE_API_KEY or ANTHROPIC_API_KEY for real generation]',
    latencyMs: 0,
    model: 'mock',
  };
}
