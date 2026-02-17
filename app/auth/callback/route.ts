import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('cheguei aqui');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  console.log('code:', code);

  // missing code → send back to sign-in
  if (!code) {
    return NextResponse.redirect(new URL('/auth/sign-in', requestUrl));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // exchange code for session (SSR client manages cookies)
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('exchangeCodeForSession error', exchangeError);
    return NextResponse.redirect(new URL('/auth/sign-in', requestUrl));
  }

  // try to resolve role and redirect accordingly (admin -> /dashboard, client -> /profile)
  let redirectTo = '/profile';
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1)
        .single();

      const role = (profile as { role?: string } | null)?.role ?? null;
      if (role === 'admin') redirectTo = '/dashboard';
      else redirectTo = '/profile';
    }
  } catch (err) {
    // fallback to /profile on any error
    console.error('failed to determine role after OAuth exchange', err);
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl));
}
