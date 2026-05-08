// 인스타 매칭 카드 LLM 프롬프트 실험 페이지.
// 1. 의뢰인 페르소나(설문 응답) 선택
// 2. 인스타 후보 raw 데이터(JSON) 입력 (bio·캡션 샘플·사진 URL·hints)
// 3. (옵션) 시스템 프롬프트 편집 — localStorage 영속
// 4. Generate → /api/casting/insta-prompt-test → InstaContent 검증 → InstaMatchReport 라이브 렌더
//
// ⚠️ LLM 키 미설정 시 503 응답. .env.local 에 GOOGLE_API_KEY 등 설정 필요.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { PERSONA_FIXTURES, getPersona } from '@/lib/casting/prompts/fixtures';
import { DEFAULT_INSTA_SYSTEM_PROMPT } from '@/lib/casting/insta/system-prompt';
import { answersToUserAnswers } from '@/app/casting/prompt-test/mapping';
import type { InstaCandidateInput } from '@/lib/casting/insta/types';
import type { InstaContent } from '@/lib/casting/insta/schema';
import { InstaMatchReport } from '../insta-template-preview/_components/InstaMatchReport';

const LS_KEY_SYSTEM_PROMPT = 'casting.insta-prompt-test.systemPrompt';
const LS_KEY_CANDIDATE_JSON = 'casting.insta-prompt-test.candidateJson';

const DEFAULT_HUNT_STATS = {
  offlineGyms: 0,
  instagramProfiles: 64,
  linkedinProfiles: 0,
  communities: 0,
};

const DEFAULT_CANDIDATE: InstaCandidateInput = {
  handle: 'design_layered',
  bio: 'Editorial designer · 전시·필름 사진 좋아함',
  samplePosts: [
    '작은 카페에서 한참 머물다 옴. 햇빛 결이 좋았어',
    '이번 주 새로 발견한 동네 전시 — 색감이 너무 좋다',
    '필름 한 롤 다 찍었다',
    '주말은 산책으로 채움',
    '에세이 한 권에 이번 달이 다 갔네',
  ],
  photoUrls: [],
  hints: {
    likelyAgeRange: '20대 후반',
    likelyOccupation: '디자이너',
    location: '서울',
  },
};

interface GenState {
  loading: boolean;
  error: string | null;
  errorDetail?: unknown;
  content: InstaContent | null;
  meta: { latencyMs: number; model: string; provider: string } | null;
  raw: unknown;
}

const INITIAL_GEN: GenState = {
  loading: false,
  error: null,
  content: null,
  meta: null,
  raw: null,
};

export default function CastingInstaPromptTestPage() {
  const [viewerId, setViewerId] = useState(PERSONA_FIXTURES[0].id);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_INSTA_SYSTEM_PROMPT);
  const [candidateJson, setCandidateJson] = useState(JSON.stringify(DEFAULT_CANDIDATE, null, 2));
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [gen, setGen] = useState<GenState>(INITIAL_GEN);

  // localStorage 복원/저장
  useEffect(() => {
    const sp = localStorage.getItem(LS_KEY_SYSTEM_PROMPT);
    if (sp) setSystemPrompt(sp);
    const cj = localStorage.getItem(LS_KEY_CANDIDATE_JSON);
    if (cj) setCandidateJson(cj);
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY_SYSTEM_PROMPT, systemPrompt);
  }, [systemPrompt]);
  useEffect(() => {
    localStorage.setItem(LS_KEY_CANDIDATE_JSON, candidateJson);
  }, [candidateJson]);

  const viewer = getPersona(viewerId)!;
  const viewerUserAnswers = useMemo(() => answersToUserAnswers(viewer.answers), [viewer]);

  const candidateParsed = useMemo<{
    ok: boolean;
    data?: InstaCandidateInput;
    error?: string;
  }>(() => {
    try {
      const obj = JSON.parse(candidateJson) as InstaCandidateInput;
      if (!obj || typeof obj !== 'object' || !Array.isArray(obj.samplePosts) || !Array.isArray(obj.photoUrls)) {
        return { ok: false, error: 'samplePosts / photoUrls 가 배열이어야 합니다.' };
      }
      return { ok: true, data: obj };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  }, [candidateJson]);

  async function onGenerate() {
    if (!candidateParsed.ok || !candidateParsed.data) return;
    setGen({ ...INITIAL_GEN, loading: true });
    try {
      const res = await fetch('/api/casting/insta-prompt-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          input: {
            viewer: { answers: viewer.answers },
            candidate: candidateParsed.data,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setGen({
          ...INITIAL_GEN,
          error: data.error || `HTTP ${res.status}`,
          errorDetail: data,
          raw: data,
        });
        return;
      }
      setGen({
        loading: false,
        error: null,
        content: data.content as InstaContent,
        meta: data.meta,
        raw: data,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setGen({ ...INITIAL_GEN, error: msg });
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink">
      {/* 컨트롤 패널 */}
      <div className="border-b border-brand-line/30 bg-brand-cream/40">
        <div className="max-w-[1080px] mx-auto px-5 py-4">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <h1 className="font-display font-bold text-[18px]">인스타 매칭 프롬프트 테스트</h1>
            <a
              href="/casting/insta-template-preview"
              className="text-[12px] underline text-brand-ink-mute"
            >
              디자인 검수 페이지 ↗
            </a>
            <span className="ml-auto text-[12px] text-brand-ink-mute">
              {gen.meta &&
                `${gen.meta.provider} · ${gen.meta.model} · ${gen.meta.latencyMs}ms`}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {/* 의뢰인 fixture */}
            <div>
              <label className="block text-[12px] text-brand-ink-soft mb-1">의뢰인 페르소나</label>
              <select
                value={viewerId}
                onChange={(e) => setViewerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-brand-line bg-white text-[13px]"
              >
                {PERSONA_FIXTURES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-brand-ink-mute leading-snug">
                {viewer.oneLiner}
              </p>
            </div>

            {/* 후보 JSON */}
            <div>
              <label className="block text-[12px] text-brand-ink-soft mb-1">
                인스타 후보 raw (JSON)
              </label>
              <textarea
                value={candidateJson}
                onChange={(e) => setCandidateJson(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-brand-line bg-white text-[12px] font-mono"
                spellCheck={false}
              />
              {!candidateParsed.ok && (
                <p className="mt-1 text-[11px] text-brand-urgent">
                  JSON 오류: {candidateParsed.error}
                </p>
              )}
            </div>
          </div>

          {/* 토글 + 액션 */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onGenerate}
              disabled={gen.loading || !candidateParsed.ok}
              className="px-4 py-2 rounded-lg bg-brand-ink text-brand-cream font-display font-bold text-[13px] disabled:opacity-50"
            >
              {gen.loading ? '생성 중…' : 'Generate'}
            </button>
            <label className="flex items-center gap-1.5 text-[12px] text-brand-ink-soft">
              <input
                type="checkbox"
                checked={showPromptEditor}
                onChange={(e) => setShowPromptEditor(e.target.checked)}
              />
              system prompt 편집
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-brand-ink-soft">
              <input
                type="checkbox"
                checked={showRaw}
                onChange={(e) => setShowRaw(e.target.checked)}
              />
              raw response
            </label>
            <button
              type="button"
              onClick={() => {
                setSystemPrompt(DEFAULT_INSTA_SYSTEM_PROMPT);
                setCandidateJson(JSON.stringify(DEFAULT_CANDIDATE, null, 2));
              }}
              className="text-[12px] underline text-brand-ink-mute"
            >
              기본값 복원
            </button>
          </div>

          {showPromptEditor && (
            <div className="mt-3">
              <label className="block text-[12px] text-brand-ink-soft mb-1">
                system prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 rounded-lg border border-brand-line bg-white text-[12px] font-mono"
                spellCheck={false}
              />
            </div>
          )}

          {gen.error && (
            <div className="mt-3 p-3 rounded-lg bg-brand-urgent/10 border border-brand-urgent/40 text-[12px] text-brand-ink leading-relaxed">
              <div className="font-bold mb-1">에러</div>
              <div>{gen.error}</div>
              {gen.errorDetail !== undefined && showRaw && (
                <pre className="mt-2 text-[11px] overflow-x-auto bg-white/60 p-2 rounded">
                  {JSON.stringify(gen.errorDetail, null, 2)}
                </pre>
              )}
            </div>
          )}

          {showRaw && gen.raw && !gen.error && (
            <pre className="mt-3 text-[11px] overflow-x-auto bg-white p-2 rounded border border-brand-line max-h-[200px]">
              {JSON.stringify(gen.raw, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* 라이브 프리뷰 */}
      {gen.content ? (
        <InstaMatchReport
          reportUid="INSTA-PROMPT-TEST"
          publishedAt={new Date().toISOString().slice(0, 10).replace(/-/g, '.')}
          viewerName="의뢰인"
          viewerAnswers={viewerUserAnswers}
          huntStats={DEFAULT_HUNT_STATS}
          content={gen.content}
          candidatePhoto={candidateParsed.data?.photoUrls[0]}
          candidateLocation={candidateParsed.data?.hints?.location}
        />
      ) : (
        <div className="max-w-[1080px] mx-auto px-5 py-12 text-center text-[13px] text-brand-ink-mute">
          Generate 버튼을 누르면 결과가 여기에 라이브로 렌더돼요.
        </div>
      )}
    </div>
  );
}
