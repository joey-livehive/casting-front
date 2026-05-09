// 인스타그램 발견 후보 매칭 — 입력/출력 타입.
// 출력 타입은 Zod 스키마(schema.ts)에서 z.infer 로 자동 도출.
// docs/casting-template/insta/02-prompt.md 와 1:1 매핑.

import type { CastingAnswers } from '@/lib/casting/prompts/types';

/** 사전 분석 LLM 이 생성한 4축 정규화 — v3 프롬프트 입력 일부. 화면 출력의 bipolarValues 와 다른 형태. */
export interface PreAnalysisTraitAxes {
  energy?: { value: number; label_left: string; label_right: string; evidence: string };
  judgment?: { value: number; label_left: string; label_right: string; evidence: string };
  sociability?: { value: number; label_left: string; label_right: string; evidence: string };
  action?: { value: number; label_left: string; label_right: string; evidence: string };
}

/** 운영자가 인스타그램에서 수집·정제한 후보 raw 데이터. */
export interface InstaCandidateInput {
  /** 핸들/닉네임 — 캐스팅은 익명이라 LLM 출력엔 노출되지 않지만 디버그·추적용. */
  handle?: string;
  /** Instagram bio 원문. */
  bio?: string;
  /** 후보 피드에서 뽑은 캡션 샘플 (5~15개 권장). LLM 톤 분석 핵심 입력. */
  samplePosts: string[];
  /** 대표 사진 URL (1~3개). LLM Vision 입력으로 사용. 첫 번째 URL 만 1차 분석에 사용. */
  photoUrls: string[];
  /** 운영자가 직접 확인한 메타 — 추정 정확도를 높이기 위한 hint. 모두 옵션. */
  hints?: {
    likelyAgeRange?: string;
    likelyOccupation?: string;
    location?: string;
  };
  // ── 사전 분석 LLM 이 정규화한 출력 (옵션) ── v3 프롬프트가 raw 보다 우선 활용.
  /** structured 메타 추정 (gender / age_band / occupation_band 등). null 값은 "단서 부족". */
  structured?: Record<string, unknown>;
  /** 항목별 신뢰도 0.0~1.0. 카피 단정 강도 조절에 사용. */
  confidence?: Record<string, number>;
  /** 사전 분석의 4축 양극 값. v3 프롬프트가 화면용 bipolarValues 로 변환. */
  trait_axes?: PreAnalysisTraitAxes;
  /** 사전 분석의 후보 인물 묘사 자연어. */
  self_text?: string;
  /** 분위기 키워드 리스트. */
  atmosphere_tags?: string[];
  /** 사전 분석 운영 메모 — 카피 노출 금지. */
  reviewer_summary?: string;
}

/** Insta 매칭 LLM 1회 호출 입력. */
export interface InstaContentInput {
  viewer: { answers: CastingAnswers };
  candidate: InstaCandidateInput;
}

export type {
  InstaContentOutput,
  InstaContent,
  InstaBipolarValues,
} from './schema';
