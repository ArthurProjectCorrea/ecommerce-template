import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Locale } from '@/lib/i18n';

// Simple in-memory rate limiter per IP (dev only)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;
const ipMap: Map<string, { count: number; start: number }> = new Map();

function getIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = (url.searchParams.get('lang') || 'en') as Locale;
  const dict = await (
    await import('@/app/[lang]/dictionaries')
  ).getDictionary(lang);

  const ip = getIp(req);
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    ipMap.set(ip, { count: 1, start: now });
  } else {
    entry.count += 1;
    ipMap.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: dict.Api.tooManyRequests },
        { status: 429 },
      );
    }
  }

  try {
    const body = await req.json();
    const { email, password, name } = body || {};
    if (!email || !password) {
      return NextResponse.json(
        { error: dict.Api.missingEmailOrPassword },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
    });

    if (error) {
      const status =
        typeof (error as { status?: unknown })?.status === 'number'
          ? (error as { status: number }).status
          : 500;
      // prefer Supabase message when available, otherwise fall back to localized server error
      const message =
        typeof (error as { message?: unknown })?.message === 'string'
          ? (error as { message: string }).message
          : dict.Api.serverError;
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ user: data.user });
  } catch (err: unknown) {
    const message =
      typeof (err as { message?: unknown })?.message === 'string'
        ? (err as { message: string }).message
        : dict.Api.serverError;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
