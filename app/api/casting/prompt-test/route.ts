import { NextResponse } from 'next/server';
import { generatePersonBundle } from '@/lib/casting/prompts/person-bundle';
import { generatePairBundle } from '@/lib/casting/prompts/pair-bundle';
import type { PersonBundleInput, PairBundleInput } from '@/lib/casting/prompts/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mode = body.mode as 'person' | 'pair';

    const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt : undefined;

    if (mode === 'person') {
      const input = body.input as PersonBundleInput;
      const result = await generatePersonBundle(input, { systemPrompt });
      return NextResponse.json({ ok: true, mode, ...result });
    }
    if (mode === 'pair') {
      const input = body.input as PairBundleInput;
      const result = await generatePairBundle(input, { systemPrompt });
      return NextResponse.json({ ok: true, mode, ...result });
    }
    return NextResponse.json({ ok: false, error: 'unknown mode' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
