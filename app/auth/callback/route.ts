import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // exchange code for session (SSR client manages cookies)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // redirect to profile (proxy will route by locale/role)
  return NextResponse.redirect(new URL('/profile', request.url));
}
