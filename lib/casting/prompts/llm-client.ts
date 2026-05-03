// 캐스팅 LLM 호출 공통 클라이언트 — Gemini 우선, Anthropic fallback.
// 환경변수 우선순위:
//   1. GOOGLE_API_KEY 또는 GEMINI_API_KEY → Gemini 1.5/2.0
//   2. ANTHROPIC_API_KEY → Claude
//   3. 둘 다 없으면 mock fallback (호출자가 처리)

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export type Provider = 'gemini' | 'anthropic' | 'mock';

export interface CallInput {
  systemPrompt: string;
  userPrompt: string;
  /** 이미지 URL (Vision 지원). Anthropic 은 URL source 직접, Gemini 는 fetch 후 base64. */
  photoUrl?: string;
  model?: string;
  maxTokens?: number;
}

export interface CallOutput {
  raw: string;
  latencyMs: number;
  model: string;
  provider: Provider;
}

const GEMINI_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? '';

export function detectProvider(): Provider {
  if (GEMINI_KEY) return 'gemini';
  if (ANTHROPIC_KEY) return 'anthropic';
  return 'mock';
}

export async function callLLM(input: CallInput): Promise<CallOutput> {
  const provider = detectProvider();
  if (provider === 'gemini') return callGemini(input);
  if (provider === 'anthropic') return callAnthropic(input);
  throw new Error('No LLM provider key configured');
}

// ── Gemini ───────────────────────────────────────────────────

async function callGemini(input: CallInput): Promise<CallOutput> {
  const modelName = input.model ?? 'gemini-2.5-flash';
  const client = new GoogleGenerativeAI(GEMINI_KEY);
  const model: GenerativeModel = client.getGenerativeModel({
    model: modelName,
    systemInstruction: input.systemPrompt,
    generationConfig: {
      maxOutputTokens: input.maxTokens ?? 8000,
      responseMimeType: 'application/json',
    },
  });

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
  if (input.photoUrl) {
    const img = await fetchImageAsBase64(input.photoUrl);
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }
  parts.push({ text: input.userPrompt });

  const t0 = Date.now();
  const res = await model.generateContent({
    contents: [{ role: 'user', parts }],
  });
  const latencyMs = Date.now() - t0;
  const raw = res.response.text();
  return { raw, latencyMs, model: modelName, provider: 'gemini' };
}

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; base64: string }> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`이미지 fetch 실패: ${url} (${resp.status})`);
  const mimeType = resp.headers.get('content-type') ?? 'image/jpeg';
  const buf = Buffer.from(await resp.arrayBuffer());
  return { mimeType, base64: buf.toString('base64') };
}

// ── Anthropic (fallback) ─────────────────────────────────────

async function callAnthropic(input: CallInput): Promise<CallOutput> {
  const modelName = input.model ?? 'claude-sonnet-4-6';
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const userContent: Anthropic.Messages.ContentBlockParam[] = input.photoUrl
    ? [
        { type: 'image', source: { type: 'url', url: input.photoUrl } },
        { type: 'text', text: input.userPrompt },
      ]
    : [{ type: 'text', text: input.userPrompt }];

  const t0 = Date.now();
  const res = await client.messages.create({
    model: modelName,
    // PERSON BUNDLE 은 9 필드(4~5문장 narratives 다수)라 2000 으로는 자주 잘림 — Gemini 와 동일하게 8000.
    max_tokens: input.maxTokens ?? 8000,
    system: input.systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });
  const latencyMs = Date.now() - t0;
  const raw = res.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return { raw, latencyMs, model: modelName, provider: 'anthropic' };
}

// ── JSON 파싱 (코드 펜스 제거) ──────────────────────────────

export function extractJsonObject(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('JSON 응답 파싱 실패: ' + raw.slice(0, 200));
  return JSON.parse(cleaned.slice(start, end + 1));
}
