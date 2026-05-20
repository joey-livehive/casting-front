import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const CASTING_API_BASE =
  process.env.CASTING_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://api.publicvoid.im' : 'http://localhost:8000');

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.CASTING_ADMIN_API_KEY || '';

export async function POST(req: Request) {
  if (!ADMIN_API_KEY) {
    return NextResponse.json({ error: 'ADMIN_API_KEY is required' }, { status: 500 });
  }

  const body = await req.text();
  const res = await fetch(`${CASTING_API_BASE}/casting/admin/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_API_KEY,
    },
    body,
    cache: 'no-store',
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
