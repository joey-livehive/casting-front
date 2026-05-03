// 캐스팅 dealbreaker 사전 필터 — radar 6축 밖에서 처리.
// 매칭 풀 진입 전 통과 검사 + 매칭 카드의 "절대 조건 통과 ✓" 카드 입력.

import type { CastingAnswers } from '@/lib/casting/prompts/types';

export interface DealbreakerCheck {
  id: string;
  label: string;
  /** true: 통과 (✓) / false: 실패 (매칭 풀에서 차단) / null: 적용 안 됨 */
  passed: boolean | null;
  reason: string;
}

function parseInt0(s: string | undefined): number {
  const n = parseInt(s ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}

export function checkDealbreakers(viewer: CastingAnswers, candidate: CastingAnswers): DealbreakerCheck[] {
  const checks: DealbreakerCheck[] = [];

  // 흡연
  const smokePref = viewer['연인이 담배 피운다면?'];
  const candidateSmoke = candidate['넌 담배 피워?'];
  if (smokePref && candidateSmoke) {
    if (smokePref === 'pref_smoke_no') {
      const passed = candidateSmoke === 'no_smoke';
      checks.push({
        id: 'smoke',
        label: '흡연',
        passed,
        reason: passed
          ? '의뢰인 비흡연 선호 / 후보 비흡연'
          : `후보 ${candidateSmoke === 'heavy_smoke' ? '자주 흡연' : '가끔 흡연'} — dealbreaker 미스`,
      });
    } else if (smokePref === 'pref_smoke_meh') {
      const passed = candidateSmoke !== 'heavy_smoke';
      checks.push({
        id: 'smoke',
        label: '흡연',
        passed,
        reason: passed ? '선호도 충족 (자주 흡연 아님)' : '후보 자주 흡연 — 미스',
      });
    }
  }

  // 음주
  const drinkPref = viewer['연인이 술 마시는 건 어때?'];
  const candidateDrink = candidate['술은 자주 마셔?'];
  if (drinkPref === 'pref_drink_no' && candidateDrink) {
    const passed = candidateDrink !== 'often_drink';
    checks.push({
      id: 'drink',
      label: '음주',
      passed,
      reason: passed ? '의뢰인 음주 비호감 / 후보 절제' : '후보 자주 음주 — 미스',
    });
  }

  // 종교
  const religionPref = viewer['상대 종교는 중요해?'];
  const candidateReligion = candidate['넌 종교가 뭐야?'];
  if (religionPref === 'pref_no_religion' && candidateReligion) {
    const passed = candidateReligion === 'none';
    checks.push({
      id: 'religion',
      label: '종교',
      passed,
      reason: passed ? '양쪽 모두 무관' : `후보 종교 있음 (${candidateReligion})`,
    });
  } else if (religionPref === 'pref_same_religion') {
    const viewerReligion = viewer['넌 종교가 뭐야?'];
    if (viewerReligion && candidateReligion) {
      const passed = viewerReligion === candidateReligion && viewerReligion !== 'none';
      checks.push({
        id: 'religion',
        label: '종교',
        passed,
        reason: passed ? `같은 종교 (${viewerReligion})` : '같은 종교 선호인데 미스매치',
      });
    }
  }

  // 거리 (매우 가까움 선호 시 같은 시·도 필수)
  const distancePref = viewer['상대와 거리는 어디까지?'];
  const viewerLoc = viewer['넌 어디쯤 사는데?'];
  const candidateLoc = candidate['넌 어디쯤 사는데?'];
  if (distancePref === 'very_near' && viewerLoc && candidateLoc) {
    const passed = viewerLoc === candidateLoc;
    checks.push({
      id: 'distance',
      label: '거리',
      passed,
      reason: passed ? `같은 ${viewerLoc}` : `${viewerLoc} ↔ ${candidateLoc}`,
    });
  } else if (distancePref === 'same_city' && viewerLoc && candidateLoc) {
    const passed = viewerLoc === candidateLoc;
    checks.push({
      id: 'distance',
      label: '거리',
      passed,
      reason: passed ? `같은 ${viewerLoc}` : `${viewerLoc} ↔ ${candidateLoc} (같은 도시 선호 미스)`,
    });
  }

  // 키 (의뢰인이 여자고 후보 키가 선호 미달일 때만 검사)
  const heightPref = viewer['키는 어느 정도?'];
  const candidateHeightCm = parseInt0(candidate['키가 어떻게 돼?']);
  if (candidateHeightCm > 0) {
    if (heightPref === 'pref_male_height_180_plus') {
      const passed = candidateHeightCm >= 180;
      checks.push({
        id: 'height',
        label: '키',
        passed,
        reason: passed ? `의뢰인 180+ 선호 / 후보 ${candidateHeightCm}cm` : `의뢰인 180+ 선호 / 후보 ${candidateHeightCm}cm 미달`,
      });
    } else if (heightPref === 'pref_male_height_172_plus') {
      const passed = candidateHeightCm >= 172;
      checks.push({
        id: 'height',
        label: '키',
        passed,
        reason: passed ? `의뢰인 172+ 선호 / 후보 ${candidateHeightCm}cm` : `의뢰인 172+ 선호 / 후보 ${candidateHeightCm}cm 미달`,
      });
    } else if (heightPref === 'pref_female_height_167_plus') {
      const passed = candidateHeightCm >= 167;
      checks.push({
        id: 'height',
        label: '키',
        passed,
        reason: passed ? `의뢰인 167+ 선호 / 후보 ${candidateHeightCm}cm` : `의뢰인 167+ 선호 / 후보 ${candidateHeightCm}cm 미달`,
      });
    }
  }

  return checks;
}

export function allDealbreakersPassed(checks: DealbreakerCheck[]): boolean {
  return checks.every((c) => c.passed !== false);
}
