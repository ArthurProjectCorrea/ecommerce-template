import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const { access_token, refresh_token } = body || {};

  if (!access_token) {
    return NextResponse.json(
      { error: 'missing access token' },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  // set httpOnly cookies so server middleware can read session
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

  // decode JWT payload (no verification) to extract user id (sub)
  let role: string | null = null;
  try {
    const payload = access_token.split('.')[1];
    const json = Buffer.from(
      payload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');
    const parsed = JSON.parse(json || '{}');
    const userId = parsed.sub as string | undefined;

    if (userId) {
      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .limit(1)
          .single();
        role = data?.role ?? null;
      }
    }
  } catch {
    role = null;
  }

  return NextResponse.json({ ok: true, role });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  return NextResponse.json({ ok: true });
}
