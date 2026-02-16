import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = (url.searchParams.get('lang') ||
    'en') as import('@/lib/i18n').Locale;
  const dict = await (
    await import('@/app/[lang]/dictionaries')
  ).getDictionary(lang);

  const body = await req.json();
  const { access_token, refresh_token } = body || {};

  if (!access_token) {
    return NextResponse.json(
      { error: dict.Api.missingAccessToken },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: 'sb-access-token',
    value: access_token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  if (refresh_token) {
    cookieStore.set({
      name: 'sb-refresh-token',
      value: refresh_token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  return NextResponse.json({ ok: true });
}
