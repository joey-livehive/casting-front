// 인스타그램 발견 후보 매칭 — 입력/출력 타입.
// 출력 타입은 Zod 스키마(schema.ts)에서 z.infer 로 자동 도출.
// docs/casting-template/insta/02-prompt.md 와 1:1 매핑.

import type { CastingAnswers } from '@/lib/casting/prompts/types';

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
