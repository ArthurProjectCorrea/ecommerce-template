import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';
import { createServerClient } from '@supabase/ssr';

function getLocale(request: NextRequest): Locale {
  const headers = {
    'accept-language': request.headers.get('accept-language') ?? '',
  };
  const languages = new Negotiator({ headers }).languages();
  const matched = match(languages, [...locales], defaultLocale);
  return matched ? (matched as Locale) : defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // if no locale present, detect and redirect to localized path
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // when path already has locale, enforce role-based redirects / protection
  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0] || defaultLocale;

  // create server Supabase client in middleware and collect cookie updates
  const response = NextResponse.next();
  type CookieEntry = {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  };
  const pendingCookies: CookieEntry[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieEntry[]) {
          // don't mutate response here (safe to accumulate and apply later)
          cookiesToSet.forEach((c) => pendingCookies.push(c));
        },
      },
    },
  );

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  // fetch role if user present
  let role: string | null = null;
  if (user) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1)
        .single();
      const profile = data as { role?: string } | null;
      role = profile?.role ?? null;
    } catch {
      role = null;
    }
  }

  // helper to apply pending cookies to a response
  const applyPendingCookies = (res: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options),
    );
    return res;
  };

  // if user hits `/:lang` root, redirect by role
  if (segments.length === 1 && pathname === `/${lang}`) {
    if (role === 'admin') {
      request.nextUrl.pathname = `/${lang}/dashboard`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    if (role === 'client') {
      request.nextUrl.pathname = `/${lang}/profile`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    return applyPendingCookies(response);
  }

  // Protect dashboard — only admin
  if (pathname.startsWith(`/${lang}/dashboard`)) {
    if (!role) {
      request.nextUrl.pathname = `/${lang}/sign-in`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    if (role !== 'admin') {
      request.nextUrl.pathname = `/${lang}/profile`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    return applyPendingCookies(response);
  }

  // Protect profile — only client
  if (pathname.startsWith(`/${lang}/profile`)) {
    if (!role) {
      request.nextUrl.pathname = `/${lang}/sign-in`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    if (role !== 'client') {
      request.nextUrl.pathname = `/${lang}/dashboard`;
      return applyPendingCookies(NextResponse.redirect(request.nextUrl));
    }
    return applyPendingCookies(response);
  }

  return applyPendingCookies(response);
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)).*)',
  ],
};
