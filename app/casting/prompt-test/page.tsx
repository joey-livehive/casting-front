// 캐스팅 매칭 카드 LLM 프롬프트 실험 페이지.
// PERSON 모드: 1명 페르소나로 PersonContent 생성.
// PAIR  모드: owner + partner 페르소나 각각 → person 호출 2번(병렬) + pair 호출 1번 → 매칭 카드 풀 렌더.
//
// ⚠️ ANTHROPIC_API_KEY 미설정 시 mock fallback. 실제 출력은 [MOCK] prefix.

'use client';

import { useState, useMemo, useEffect } from 'react';
import { PERSONA_FIXTURES, getPersona } from '@/lib/casting/prompts/fixtures';
import {
  DEFAULT_PERSON_SYSTEM_PROMPT,
  DEFAULT_PAIR_SYSTEM_PROMPT,
} from '@/lib/casting/prompts/system-prompts';
import {
  computePairRadar,
  checkDealbreakers,
  allDealbreakersPassed,
  type PairRadar,
  type DealbreakerCheck,
} from '@/lib/casting/radar';
import type {
  PairContentOutput,
  PersonContent,
  CastingAnswers,
} from '@/lib/casting/prompts/types';
import type { Candidate, MatchAnalysis } from '@/lib/report/types';
import { TopNav } from '@/components/report/TopNav';
import { ApplicationSummary } from '@/components/report/ApplicationSummary';
import { Chapter4Simulation } from '@/components/report/Chapter4Simulation';
import { ReportShell } from '@/components/report/ReportShell';
import { TrackSection } from '@/components/report/TrackSection';
import { MeetOrPassCta } from '@/components/report/MeetOrPassCta';
import { CasterNoteSection } from '../template-preview/_components/CasterNoteSection';
import { HeroV2 } from '../template-preview/_components/HeroV2';
import { HuntBoxV2 } from '../template-preview/_components/HuntBoxV2';
import { TeaserCardV2 } from '../template-preview/_components/TeaserCardV2';
import { CandidateDetailSection } from '../template-preview/_components/CandidateDetailSection';
import { ReadingCardV2 } from '../template-preview/_components/ReadingCardV2';
import { Chapter3V2 } from '../template-preview/_components/Chapter3V2';
import { answersToUserAnswers, answersToCandidate } from './mapping';

type Mode = 'person' | 'pair';

interface GenState {
  loading: boolean;
  error: string | null;
  ownerPersonContent: PersonContent | null;
  partnerPersonContent: PersonContent | null;
  pairContent: PairContentOutput | null;
  meta: { latencyMs: number; model: string }[];
  raw: string;
}

const MOCK_HUNT_STATS = {
  offlineGyms: 5,
  instagramProfiles: 42,
  linkedinProfiles: 18,
  communities: 5,
};

const LS_KEY_PERSON = 'casting.prompt-test.personSystemPrompt';
const LS_KEY_PAIR = 'casting.prompt-test.pairSystemPrompt';

export default function CastingPromptTestPage() {
  const [mode, setMode] = useState<Mode>('person');
  const [viewerId, setViewerId] = useState(PERSONA_FIXTURES[0].id);
  const [candidateId, setCandidateId] = useState(PERSONA_FIXTURES[1].id);
  const [showRaw, setShowRaw] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [personPrompt, setPersonPrompt] = useState(DEFAULT_PERSON_SYSTEM_PROMPT);
  const [pairPrompt, setPairPrompt] = useState(DEFAULT_PAIR_SYSTEM_PROMPT);

  // localStorage 복원
  useEffect(() => {
    const p = localStorage.getItem(LS_KEY_PERSON);
    const pa = localStorage.getItem(LS_KEY_PAIR);
    if (p) setPersonPrompt(p);
    if (pa) setPairPrompt(pa);
  }, []);

  // localStorage 저장
  useEffect(() => {
    localStorage.setItem(LS_KEY_PERSON, personPrompt);
  }, [personPrompt]);
  useEffect(() => {
    localStorage.setItem(LS_KEY_PAIR, pairPrompt);
  }, [pairPrompt]);

  const [gen, setGen] = useState<GenState>({
    loading: false,
    error: null,
    ownerPersonContent: null,
    partnerPersonContent: null,
    pairContent: null,
    meta: [],
    raw: '',
  });

  const viewer = getPersona(viewerId)!;
  const candidate = getPersona(mode === 'person' ? viewerId : candidateId)!;

  async function callBackendPreview(args: {
    ownerAnswers: CastingAnswers;
    partnerAnswers: CastingAnswers;
  }) {
    const started = performance.now();
    const res = await fetch('/api/casting/prompt-test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        owner_uid: viewer.id,
        partner_uid: candidate.id,
        owner_answers: args.ownerAnswers,
        partner_answers: args.partnerAnswers,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`backend preview api ${res.status}: ${text}`);
    }
    const data = await res.json();
    return {
      data,
      latencyMs: Math.round(performance.now() - started),
      model: [
        data?.report_json?.meta?.owner_person_content_model,
        data?.report_json?.meta?.partner_person_content_model,
        data?.report_json?.meta?.pair_content_model,
      ].filter(Boolean).join(' / ') || 'backend',
    };
  }

  async function onGenerate() {
    setGen((s) => ({ ...s, loading: true, error: null }));
    try {
      const meta: GenState['meta'] = [];
      const rawParts: string[] = [];
      let ownerPersonContent: PersonContent | null = null;
      let partnerPersonContent: PersonContent | null = null;
      let pairContent: PairContentOutput | null = null;

      const r = await callBackendPreview({
        ownerAnswers: viewer.answers,
        partnerAnswers: candidate.answers,
      });
      const reportJson = r.data.report_json;
      ownerPersonContent = reportJson.ownerPersonContent;
      partnerPersonContent = reportJson.partnerPersonContent;
      pairContent = reportJson.pairContent;
      meta.push({ latencyMs: r.latencyMs, model: r.model });
      rawParts.push(`[backend/${mode}/${viewer.id}/${candidate.id}]\n${JSON.stringify(r.data, null, 2)}`);

      setGen({
        loading: false,
        error: null,
        ownerPersonContent,
        partnerPersonContent,
        pairContent,
        meta,
        raw: rawParts.join('\n\n---\n\n'),
      });
    } catch (e) {
      setGen((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
    }
  }

  const ownerPersonContent = gen.ownerPersonContent;
  const partnerPersonContent = gen.partnerPersonContent;

  // 결정론 radar 점수 — LLM 무관, persona 선택 즉시 계산
  const radar: PairRadar = useMemo(
    () => computePairRadar(viewer.answers, candidate.answers),
    [viewer, candidate]
  );
  const dealbreakers: DealbreakerCheck[] = useMemo(
    () => checkDealbreakers(viewer.answers, candidate.answers),
    [viewer, candidate]
  );
  const dealbreakerOk = allDealbreakersPassed(dealbreakers);

  // 우측 매칭 카드 렌더용 데이터 — content 없으면 placeholder
  const candidateForCard: Candidate = useMemo(() => {
    return answersToCandidate(candidate.answers, partnerPersonContent ?? undefined);
  }, [candidate, partnerPersonContent]);
  const userAnswers = useMemo(() => answersToUserAnswers(viewer.answers), [viewer]);

  const totalLatency = gen.meta.reduce((a, m) => a + m.latencyMs, 0);

  // 매칭 데이터 — radar 는 결정론, notes/simulation 은 LLM pair content 출력
  const match: MatchAnalysis = useMemo(() => {
    return {
      matchRate: radar.matchRate,
      topPercent: radar.topPercent,
      radarData: {
        labels: radar.labels,
        values: radar.values,
      },
      simulation:
        gen.pairContent?.simulation ??
        '아직 pair content 출력이 없습니다. PAIR 모드에서 Generate 해보세요.',
      notes:
        gen.pairContent?.axisNotes.map((n) => `<b>${n.axis}</b> — ${n.narrative}`) ??
        radar.topAxes.map(
          (t) => `<b>${t.label.replace(/\n/g, ' ')}</b> — pairScore ${t.pairScore.toFixed(1)} (radar 룰 기반 placeholder)`
        ),
    };
  }, [radar, gen.pairContent]);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* 좌측 패널 */}
      <aside className="w-[400px] shrink-0 bg-white border-r border-zinc-200 p-5 overflow-y-auto sticky top-0 h-screen">
        <h1 className="text-[18px] font-bold text-zinc-900 mb-1">Prompt Test</h1>
        <p className="text-[12px] text-zinc-500 mb-5">
          페르소나 입력에 따라 LLM 출력이 어떻게 달라지는지 실험
        </p>

        <Section title="Mode">
          <div className="flex gap-2">
            <ModeButton active={mode === 'person'} onClick={() => setMode('person')}>
              PERSON
            </ModeButton>
            <ModeButton active={mode === 'pair'} onClick={() => setMode('pair')}>
              PAIR
            </ModeButton>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            {mode === 'person'
              ? 'PERSON: 1명 페르소나로 PersonContent 생성'
              : 'PAIR: owner + partner 각각 person 생성 → pair 호출 (LLM 3회)'}
          </p>
        </Section>

        <Section title={mode === 'person' ? 'Persona' : 'Viewer (의뢰인)'}>
          <PersonaPicker value={viewerId} onChange={setViewerId} />
        </Section>

        {mode === 'pair' && (
          <Section title="Candidate (매칭 상대)">
            <PersonaPicker value={candidateId} onChange={setCandidateId} excludeId={viewerId} />
          </Section>
        )}

        {/* Radar 결정론 점수 — LLM 호출 없이 즉시 계산 */}
        <Section title={`Radar 점수 (결정론) — 매칭률 ${radar.matchRate}%`}>
          <div className="space-y-1">
            {radar.axes.map((a) => (
              <div key={a.axisId} className="flex items-center gap-2 text-[11px]">
                <div className="w-[70px] text-zinc-700">{a.label.replace(/\n/g, ' ')}</div>
                <div className="flex-1 flex items-center gap-1">
                  <span className="w-6 text-right text-blue-700 font-mono">{a.viewerScore.toFixed(1)}</span>
                  <span className="text-zinc-400">/</span>
                  <span className="w-6 text-orange-700 font-mono">{a.candidateScore.toFixed(1)}</span>
                  <span className="text-zinc-400 ml-1">→</span>
                  <span className="w-7 text-right font-mono text-zinc-900 font-semibold">
                    {a.pairScore.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-zinc-400">×{a.alignment}</span>
                </div>
              </div>
            ))}
            <div className="text-[10px] text-zinc-500 mt-1">
              <span className="text-blue-700">viewer</span> /{' '}
              <span className="text-orange-700">candidate</span> → pairScore (×alignment)
            </div>
          </div>
        </Section>

        {dealbreakers.length > 0 && (
          <Section
            title={`사전 필터 (${dealbreakerOk ? '✅ 통과' : '❌ 미스'})`}
          >
            <div className="space-y-1">
              {dealbreakers.map((d) => (
                <div
                  key={d.id}
                  className={`text-[11px] flex items-start gap-1.5 ${
                    d.passed ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  <span>{d.passed ? '✅' : '❌'}</span>
                  <span>
                    <b>{d.label}</b> — {d.reason}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <button
          onClick={onGenerate}
          disabled={gen.loading}
          className="w-full mt-2 py-3 rounded-lg bg-zinc-900 text-white font-semibold disabled:opacity-40 hover:bg-zinc-800"
        >
          {gen.loading ? 'Generating…' : 'Generate'}
        </button>

        {gen.error && (
          <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-[12px]">
            {gen.error}
          </div>
        )}

        {gen.meta.length > 0 && (
          <div className="mt-4 text-[11px] text-zinc-600 space-y-1">
            <div>📡 호출 {gen.meta.length}회 · 총 {totalLatency}ms</div>
            {gen.meta.map((m, i) => (
              <div key={i} className="text-zinc-500">
                · {m.model} ({m.latencyMs}ms)
              </div>
            ))}
            {gen.meta.some((m) => m.model === 'mock') && (
              <div className="mt-1 text-amber-700">
                ⚠ mock 모드 — ANTHROPIC_API_KEY 를 .env.local 에 설정하세요.
              </div>
            )}
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
                label="PERSON CONTENT system prompt"
                value={personPrompt}
                defaultValue={DEFAULT_PERSON_SYSTEM_PROMPT}
                onChange={setPersonPrompt}
              />
              <PromptField
                label="PAIR CONTENT system prompt"
                value={pairPrompt}
                defaultValue={DEFAULT_PAIR_SYSTEM_PROMPT}
                onChange={setPairPrompt}
              />
              <p className="text-[10px] text-zinc-500">
                💾 변경사항은 localStorage 에 자동 저장됩니다. 현재 Generate 는 백엔드 preview API를 타므로
                서버 route가 백엔드 preview API를 호출하므로 배포된 기본 프롬프트가 사용됩니다.
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
              {gen.raw || '(empty)'}
            </pre>
          )}
        </div>
      </aside>

      {/* 우측: 매칭 카드 렌더 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto pb-[60px] relative bg-brand-bg min-h-screen font-body text-brand-ink">
          <ReportShell reportId="PROMPT-TEST" tone="formal" variant="paid">
            <TopNav publishedAt="LIVE" />
            <HeroV2 userName="의뢰인" />

            <CasterNoteSection
              headline={partnerPersonContent?.casterHeadline ?? '(여기에 캐스터의 한마디가 표시됩니다 — Generate 클릭)'}
              charmBullets={
                partnerPersonContent?.casterCharmBullets ?? [
                  '(매력 포인트 1)',
                  '(매력 포인트 2)',
                  '(매력 포인트 3)',
                ]
              }
            />

            <HuntBoxV2
              stats={MOCK_HUNT_STATS}
              footer={
                <div className="relative w-full overflow-hidden rounded-[12px] mt-4" style={{ paddingTop: '33.125%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/earth.webp" alt="찾아온 경로" className="absolute inset-x-0 top-0 w-full block" />
                </div>
              }
            />

            <TrackSection section="teaser_card" reportId="PROMPT-TEST">
              <TeaserCardV2 candidate={candidateForCard} />
            </TrackSection>

            <ReadingCardV2
              userName="의뢰인"
              narratives={{
                viewerInsight: ownerPersonContent?.summary ?? '(owner 인사이트가 여기에 표시됩니다)',
                matchOpening:
                  gen.pairContent?.matchOpening ?? '(매칭 다리 카피가 여기에 표시됩니다)',
                candidateMatch: partnerPersonContent?.summary ?? '(partner 인물평이 여기에 표시됩니다)',
              }}
            />

            <TrackSection section="chapter1" reportId="PROMPT-TEST">
              <CandidateDetailSection
                userName="의뢰인"
                candidate={candidateForCard}
                narratives={{
                  personality: partnerPersonContent?.personality ?? '(성격 묘사 placeholder)',
                  datingStyle: partnerPersonContent?.datingStyle ?? '(연애 스타일 placeholder)',
                  weekendStyle: partnerPersonContent?.weekendStyle ?? '(주말 모습 placeholder)',
                }}
              />
            </TrackSection>

            <TrackSection section="chapter3" reportId="PROMPT-TEST">
              <Chapter3V2 match={match} number="CHAPTER 2" />
            </TrackSection>

            <Chapter4Simulation match={match} number="CHAPTER 3" />

            <div className="px-7 mt-14 mb-3">
              <div className="border-t border-dashed border-brand-ink/30" />
            </div>

            <ApplicationSummary userAnswers={userAnswers} />

            <MeetOrPassCta reportId="PROMPT-TEST" />
          </ReportShell>
        </div>
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

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded text-[13px] font-medium border ${
        active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
      }`}
    >
      {children}
    </button>
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
        rows={10}
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
  excludeId,
}: {
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
}) {
  return (
    <div className="space-y-1.5">
      {PERSONA_FIXTURES.filter((p) => p.id !== excludeId).map((p) => (
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
