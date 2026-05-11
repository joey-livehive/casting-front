/**
 * ConnectionReport — 백엔드 `casting/profile/schema.py` 의 Pydantic ConnectionReport 와 1:1 매핑.
 *
 * 라우트:
 *   GET /casting/connection/casting/{uid}   → perspective='owner'
 *   GET /casting/connection/cast/{uid}      → perspective='partner' (commit 4)
 *
 * 본 모듈은 타입 정의 + server-side fetch 함수만. 컴포넌트 props 매핑은
 * connection-adapter.ts 가 담당.
 */

import { CASTING_API_BASE } from './api';

export type Source = 'internal' | 'insta';
export type Perspective = 'owner' | 'partner';
export type Gender = 'male' | 'female';
export type AxisName = 'energy' | 'judgment' | 'sociability' | 'action';

export type TraitAxisValue = {
  value: number; // 0~100
  label_left?: string | null;
  label_right?: string | null;
  evidence?: string | null;
};

export type TraitAxes = {
  energy: TraitAxisValue;
  judgment: TraitAxisValue;
  sociability: TraitAxisValue;
  action: TraitAxisValue;
};

export type ProfileBasics = {
  age?: number | null;
  age_band?: string | null;
  gender?: Gender | null;
  region_code?: string | null;
  occupation?: string | null;
  occupation_band?: string | null;
  job_detail?: string | null;
  height_cm?: number | null;
  height_band?: string | null;
  body_type?: string | null;
  mbti?: string | null;
  drinking_style?: string | null;
  smoking_status?: string | null;
  income_band?: string | null;
  religion?: string | null;
};

export type ProfilePhoto = {
  url: string;
  source: 'profile' | 'insta_post';
};

export type PostMeta = {
  index: number;
  tags: string[];
  vibe?: string | null;
  appeal_to: string[];
  showability: number;
};

export type Confidence = {
  overall: number;
  age?: number | null;
  body_type?: number | null;
  height?: number | null;
  drinking?: number | null;
  occupation?: number | null;
  trait_axes?: number | null;
};

export type Profile = {
  source: Source;
  uid?: string | null;
  basics: ProfileBasics;
  traits: {
    trait_axes: TraitAxes;
    atmosphere_tags?: string[] | null;
  };
  self_text: string;
  message?: string | null;
  photos?: ProfilePhoto[] | null;
  posts_meta?: PostMeta[] | null;
  reviewer_summary?: string | null;
  confidence: Confidence;
  raw?: Record<string, unknown> | null;
};

export type Dealbreakers = {
  smoking?: string | null;
  drinking?: string | null;
};

export type IdealCriteria = {
  age_mode?: 'younger' | 'older' | 'same_age' | 'any_age' | null;
  age_min?: number | null;
  age_max?: number | null;
  regions?: string[] | null;
  height?: string | null;
  body_type?: string | null;
  attraction_factor?: 'appearance' | 'personality' | 'competence' | 'vibe' | null;
  meeting_frequency?: string | null;
  contact_style?: string | null;
  relationship_intent?: 'serious_dating' | 'casual_chat' | 'casual_meet' | null;
  date_style?: 'culture' | 'home' | 'outdoor' | 'nightlife' | null;
  drinking_preference?: string | null;
  smoking_preference?: string | null;
  religion_preference?: string | null;
  distance_preference?: string | null;
  dealbreakers?: Dealbreakers | null;
};

export type Bullet = { text: string };

export type BipolarValues = {
  energy: number;
  judgment: number;
  sociability: number;
  action: number;
};

export type PersonContent = {
  casterHeadline: string;
  casterCharmBullets: Bullet[];
  faceType: string;
  personality: string;
  datingStyle: string;
  lifeStyle: string;
  bipolarValues: BipolarValues;
  spectrumNotes: string[];
};

export type AxisNote = {
  axis: AxisName;
  narrative: string;
};

// v5: ConnectionContent 는 narrative-only (opening + simulation).
// axisNotes 는 ConnectionReport.axisNotes top-level (Optional, insta 시점만).
export type ConnectionContent = {
  opening: string;
  simulation: string;
};

export type RadarAxis = {
  label: string;
  values: { owner: number; partner: number };
};

export type RadarResult = {
  score: number;
  top_percent?: number | null;
  axes: RadarAxis[];
  dealbreakers_passed: boolean;
};

export type ConnectionParticipant = {
  profile: Profile;
  person_content: PersonContent;
  ideal?: IdealCriteria | null;
};

export type ConnectionReportMeta = {
  partner_source: Source;
  hunt_stats?: {
    offlineGyms?: number | null;
    instagramProfiles?: number | null;
    linkedinProfiles?: number | null;
    communities?: number | null;
  } | null;
  scene_image?: string | null;
  generated_at?: string | null;
};

export type ConnectionReport = {
  connection_uid: string;
  perspective: Perspective;
  owner: ConnectionParticipant;
  partner: ConnectionParticipant;
  content: ConnectionContent;

  // v5: radar / axisNotes 는 alternate. partner.source 가 어느 쪽 채울지 결정.
  //   partner.source=internal → radar 채움, axisNotes=null
  //   partner.source=insta    → axisNotes 채움, radar=null
  radar: RadarResult | null;
  axisNotes: AxisNote[] | null;

  meta: ConnectionReportMeta;
};

// ── Server-side fetch ─────────────────────────────────────────────────────

export class ConnectionReportFetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ConnectionReportFetchError';
  }
}

/**
 * Owner 시점 ConnectionReport 를 백엔드에서 가져온다.
 *
 * Next.js server component 에서 호출한다. 캐시는 짧게 (revalidate 30s) —
 * 실제 cache 는 백엔드의 person/pair JSON 캐시가 담당하므로 프론트는 짧게
 * 가져와도 LLM 재호출 위험 없음.
 */
export async function fetchOwnerConnectionReport(
  uid: string,
): Promise<ConnectionReport> {
  const res = await fetch(
    `${CASTING_API_BASE}/casting/connection/casting/${encodeURIComponent(uid)}`,
    {
      next: { revalidate: 30 },
    },
  );
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // ignore JSON parse failure
    }
    throw new ConnectionReportFetchError(res.status, detail);
  }
  return (await res.json()) as ConnectionReport;
}
