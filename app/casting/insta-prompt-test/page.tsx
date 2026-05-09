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
  offlineGyms: 4,
  instagramProfiles: 142,
  linkedinProfiles: 18,
  communities: 7,
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
    <div className="min-h-screen bg-zinc-50 flex">
      {/* 좌측 패널 */}
      <aside className="w-[400px] shrink-0 bg-white border-r border-zinc-200 p-5 overflow-y-auto sticky top-0 h-screen">
        <h1 className="text-[18px] font-bold text-zinc-900 mb-1">Insta Prompt Test</h1>
        <p className="text-[12px] text-zinc-500 mb-3">
          의뢰인 페르소나 + 인스타 후보 raw 로 InstaContent 를 생성해 매칭 카드로 라이브 렌더
        </p>
        <a
          href="/casting/insta-template-preview"
          className="inline-block text-[11px] underline text-zinc-500 mb-5"
        >
          디자인 검수 페이지 ↗
        </a>

        <Section title="Viewer (의뢰인)">
          <PersonaPicker value={viewerId} onChange={setViewerId} />
        </Section>

        <Section title="Candidate raw (JSON)">
          <textarea
            value={candidateJson}
            onChange={(e) => setCandidateJson(e.target.value)}
            rows={12}
            className="w-full text-[10px] font-mono p-2 border border-zinc-300 rounded resize-y focus:border-zinc-900 focus:outline-none"
            spellCheck={false}
          />
          {!candidateParsed.ok && (
            <div className="mt-1 text-[10px] text-red-700">JSON 오류: {candidateParsed.error}</div>
          )}
          <button
            type="button"
            onClick={() => setCandidateJson(JSON.stringify(DEFAULT_CANDIDATE, null, 2))}
            className="mt-1 text-[10px] text-zinc-500 underline"
          >
            Reset to default
          </button>
        </Section>

        <button
          onClick={onGenerate}
          disabled={gen.loading || !candidateParsed.ok}
          className="w-full mt-2 py-3 rounded-lg bg-zinc-900 text-white font-semibold disabled:opacity-40 hover:bg-zinc-800"
        >
          {gen.loading ? 'Generating…' : 'Generate'}
        </button>

        {gen.error && (
          <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-[12px]">
            <div className="font-semibold mb-0.5">에러</div>
            <div>{gen.error}</div>
            {gen.errorDetail !== undefined && showRaw && (
              <pre className="mt-2 text-[10px] overflow-x-auto bg-white/60 p-2 rounded whitespace-pre-wrap break-all">
                {JSON.stringify(gen.errorDetail, null, 2)}
              </pre>
            )}
          </div>
        )}

        {gen.meta && (
          <div className="mt-4 text-[11px] text-zinc-600 space-y-1">
            <div>📡 {gen.meta.provider} · {gen.meta.model} ({gen.meta.latencyMs}ms)</div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-zinc-200">
          <button
            onClick={() => setShowPromptEditor((v) => !v)}
            className="text-[12px] font-semibold text-zinc-700 hover:text-zinc-900"
          >
            {showPromptEditor ? '▼' : '▶'} System Prompt 편집
          </button>
          {showPromptEditor && (
            <div className="mt-3 space-y-4">
              <PromptField
                label="INSTA CONTENT system prompt"
                value={systemPrompt}
                defaultValue={DEFAULT_INSTA_SYSTEM_PROMPT}
                onChange={setSystemPrompt}
              />
              <p className="text-[10px] text-zinc-500">
                💾 변경사항은 localStorage 에 자동 저장됩니다. Generate 시 이 프롬프트가 그대로 LLM 에 전달됩니다.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="text-[11px] text-zinc-500 underline"
          >
            {showRaw ? 'Hide' : 'Show'} raw JSON
          </button>
          {showRaw && (
            <pre className="mt-2 p-3 bg-zinc-900 text-zinc-100 text-[10px] rounded overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
              {gen.raw ? JSON.stringify(gen.raw, null, 2) : '(empty)'}
            </pre>
          )}
        </div>
      </aside>

      {/* 우측: 매칭 카드 라이브 프리뷰 */}
      <main className="flex-1 overflow-y-auto">
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
          <div className="max-w-[480px] mx-auto pt-20 px-7 text-center text-[13px] text-zinc-500">
            Generate 버튼을 누르면 결과가 여기에 라이브로 렌더돼요.
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">{title}</div>
      {children}
    </div>
  );
}

function PromptField({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
}) {
  const isModified = value !== defaultValue;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-semibold text-zinc-600">{label}</label>
        <button
          onClick={() => onChange(defaultValue)}
          disabled={!isModified}
          className="text-[10px] text-zinc-500 underline disabled:opacity-30"
        >
          Reset to default
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        className="w-full text-[10px] font-mono p-2 border border-zinc-300 rounded resize-y focus:border-zinc-900 focus:outline-none"
      />
      {isModified && (
        <div className="mt-0.5 text-[10px] text-amber-700">⚠ default 와 다른 상태</div>
      )}
    </div>
  );
}

function PersonaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {PERSONA_FIXTURES.map((p) => (
        <label
          key={p.id}
          className={`block p-2.5 rounded border cursor-pointer text-[12px] ${
            value === p.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'
          }`}
        >
          <input
            type="radio"
            name="persona"
            value={p.id}
            checked={value === p.id}
            onChange={() => onChange(p.id)}
            className="sr-only"
          />
          <div className="font-medium text-zinc-900">{p.label}</div>
          <div className="text-zinc-500 mt-0.5">{p.oneLiner}</div>
        </label>
      ))}
    </div>
  );
}
