/**
 * 백엔드 GET /casting/auth/me/dashboard 응답 스키마.
 *   - backend enum: MatchReportStatus / DashboardMatch.stage / OutreachStatus /
 *     ReportActionType / ProfileSource 와 1:1 매핑된다.
 *   - DashboardMatch 가 매칭 카드 1장에 해당.
 */

export type DashboardOrder = {
  order_id: string;
  product_id: string;
  product_name: string;
  credits: number;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
};

export type Stage = 'preparing' | 'ready' | 'contact_requested' | 'connected' | 'failed';
export type ReportStatus = 'queued' | 'generating' | 'published' | 'failed';

export type DashboardMatch = {
  matching_uid?: string | null;
  matching_status?: string | null;
  report_uid: string | null;
  owner_report_uid?: string | null;
  partner_report_uid?: string | null;
  status: ReportStatus | string | null;
  stage: Stage | string;
  partner_source: string | null;
  partner_uid?: string | null;
  score: number | null;
  order_id: string | null;
  report_url: string | null;
  viewer_action?: 'none' | 'like' | 'pass' | 'contact_request' | 'receiver_accept' | 'receiver_decline' | 'block' | 'report';
  contact_requested_at: string | null;
  mutual_match_at: string | null;
  outreach_status: string | null;
  matched_at?: string | null;
  owner_notified_at?: string | null;
  story_tagged_at?: string | null;
  asked_at?: string | null;
  partner_replied_at?: string | null;
  partner_accepted_at?: string | null;
  partner_declined_at?: string | null;
  signed_up_at?: string | null;
  contacts_shared_at?: string | null;
  owner_notified_declined_at?: string | null;
  cancelled_at?: string | null;
  partner_nickname?: string | null;
  partner_age?: number | null;
  partner_region?: string | null;
  partner_job?: string | null;
  partner_tagline?: string | null;
  partner_image_url?: string | null;
  viewer_role?: 'owner' | 'partner' | string;
  access_type?: 'paid' | 'free_invite' | string;
  created_at: string;
  updated_at: string;
};

export type DashboardResponse = {
  user: {
    user_uid: string;
    email: string;
    phone: string | null;
    last_login_at: string;
    created_at: string;
  };
  phone_verified: boolean;
  credits: {
    balance: number;
    total_purchased: number;
    total_used: number;
    linked_guest_count: number;
  };
  orders: DashboardOrder[];
  matches: DashboardMatch[];
};

/** 백엔드 응답에는 없지만 mock 단계에서 카드 본문 표시를 위해 채워두는 augment. */
export type MockMatchExtras = {
  partner_nickname?: string;
  partner_age?: number;
  partner_region?: string;
  partner_job?: string;
  partner_tagline?: string;
  ended_at?: string;
};

export type Match = DashboardMatch & MockMatchExtras;

export type Tone = 'pending' | 'progress' | 'good' | 'bad';

export type TimelineEvent = {
  at: string;
  label: string;
  by: 'system' | 'me' | 'operator' | 'partner';
};
