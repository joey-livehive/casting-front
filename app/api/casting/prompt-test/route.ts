import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const CASTING_API_BASE = process.env.CASTING_PROMPT_API_URL
  || process.env.NEXT_PUBLIC_CASTING_PROMPT_API_URL
  || process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'production' ? 'https://api.publicvoid.im' : 'http://localhost:8000');

function isEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_PROMPT_TEST === '1';
}

export async function POST(req: Request) {
  if (!isEnabled()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const secret = process.env.CASTING_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    return NextResponse.json(
      { ok: false, error: 'CASTING_WEBHOOK_SECRET is required for production prompt-test proxy' },
      { status: 500 },
    );
  }

  try {
    const body = await req.json();
    const res = await fetch(`${CASTING_API_BASE}/casting/admin/recommendation-reports/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'X-Casting-Webhook-Secret': secret } : {}),
      },
      body: JSON.stringify({
        owner_uid: body.owner_uid,
        partner_uid: body.partner_uid,
        owner_answers: body.owner_answers,
        partner_answers: body.partner_answers,
      }),
      cache: 'no-store',
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `backend preview api ${res.status}: ${text}` },
        { status: res.status },
      );
    }
    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
