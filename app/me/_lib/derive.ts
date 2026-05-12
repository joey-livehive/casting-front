import { C } from './tokens';
import type { Match, TimelineEvent, Tone } from './types';

/** 백엔드 ProfileSource enum 중 'guest'(우리 회원) 외 채널 라벨. */
export const PROFILE_SOURCE_LABEL: Record<string, string> = {
  instagram: '인스타 후보',
  twitter: '트위터 후보',
  tiktok: '틱톡 후보',
  manual: '운영자 큐레이션',
  photo_only: '사진 후보',
};

export function isExternalSource(source: string | null | undefined): boolean {
  return !!source && source !== 'guest';
}

export function toneColor(tone: Tone): string {
  switch (tone) {
    case 'pending':
      return C.muted;
    case 'progress':
      return C.accent;
    case 'good':
      return C.ok;
    case 'bad':
      return C.bad;
  }
}

/** 백엔드 stage + outreach_status + viewer_action 을 사용자에게 보이는 한 줄 라벨로 매핑. */
export function deriveStatusLabel(m: Match): { label: string; tone: Tone } {
  if (m.viewer_action === 'pass') return { label: '의뢰인님이 패스함', tone: 'pending' };

  if (isExternalSource(m.partner_source) && m.outreach_status) {
    switch (m.outreach_status) {
      case 'agreed':
      case 'signed_up':
        return { label: '응답 도착 · 진행 중', tone: 'good' };
      case 'contacted':
        return { label: '운영자가 연락 중', tone: 'progress' };
      case 'pending':
        return { label: '연결 요청 대기', tone: 'progress' };
      case 'declined':
      case 'no_response':
      case 'removed':
        return { label: '응답 없음 / 거절', tone: 'bad' };
    }
  }

  switch (m.stage) {
    case 'preparing':
      return { label: '카드 준비 중', tone: 'pending' };
    case 'ready':
      return { label: '아직 결정 안 함', tone: 'pending' };
    case 'contact_requested':
      return m.mutual_match_at
        ? { label: '상대 수락 · 연락처 공유 임박', tone: 'good' }
        : { label: '상대에게 연락 중', tone: 'progress' };
    case 'connected':
      return { label: '연락처 공유 완료', tone: 'good' };
    case 'failed':
      return { label: '상대가 거절', tone: 'bad' };
    default:
      return { label: String(m.stage), tone: 'pending' };
  }
}

const HOURS = 1000 * 60 * 60;
const DAYS = HOURS * 24;
const ENDED_OUTREACH = new Set(['declined', 'no_response', 'removed']);
const ENDED_STAGES = new Set(['connected', 'failed']);

export function isEnded(m: Match): boolean {
  if (m.viewer_action === 'pass') return true;
  if (ENDED_STAGES.has(m.stage)) return true;
  if (m.outreach_status && ENDED_OUTREACH.has(m.outreach_status)) return true;
  return false;
}

export function endedAtOf(m: Match): string | null {
  return m.ended_at ?? m.updated_at ?? null;
}

/** soft-hide 정책: 사이클 종료 후 3일 안에 사라진다. 0 = 오늘 자동 삭제. */
export function daysUntilExpire(m: Match): number | null {
  const endedAt = endedAtOf(m);
  if (!endedAt) return null;
  const endedMs = new Date(endedAt).getTime();
  const remainingDays = 3 - Math.floor((Date.now() - endedMs) / DAYS);
  return Math.max(0, remainingDays);
}

function addMs(iso: string, ms: number): string {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

/** DashboardMatch 의 timestamp 필드들로 사람이 읽는 진행 이벤트 줄을 만든다. */
export function deriveTimeline(m: Match): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { at: m.created_at, label: '매칭 리포트 발급', by: 'system' },
  ];

  if (m.viewer_action === 'pass') {
    events.push({ at: m.updated_at, label: '의뢰인님이 패스함', by: 'me' });
    return events;
  }

  if (m.contact_requested_at) {
    events.push({ at: m.contact_requested_at, label: '의뢰인님이 연결 요청', by: 'me' });
    const operatorLabel = isExternalSource(m.partner_source)
      ? '운영자가 상대에게 DM 시도'
      : '운영자가 상대에게 연락 시작';
    events.push({ at: addMs(m.contact_requested_at, 4 * HOURS), label: operatorLabel, by: 'operator' });
  }

  if (m.mutual_match_at) {
    events.push({ at: m.mutual_match_at, label: '상대가 연결 수락', by: 'partner' });
  }

  if (m.stage === 'connected') {
    events.push({ at: m.updated_at, label: '연락처 공유 완료', by: 'system' });
  } else if (m.stage === 'failed') {
    events.push({ at: m.updated_at, label: '상대가 응답 없음 / 거절', by: 'partner' });
  }

  return events;
}
