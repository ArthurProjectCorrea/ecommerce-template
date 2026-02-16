import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

function getLocale(request: NextRequest): Locale {
  const headers = {
    'accept-language': request.headers.get('accept-language') ?? '',
  };
  const languages = new Negotiator({ headers }).languages();
  const matched = match(languages, [...locales], defaultLocale);
  return matched ? (matched as Locale) : defaultLocale;
}

async function getRole(request: NextRequest): Promise<string | null> {
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: { cookie: request.headers.get('cookie') || '' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => ({}));
    return (json?.role as string) || null;
  } catch {
    return null;
  }
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

  // if user hits `/:lang` root, redirect by role
  if (segments.length === 1 && pathname === `/${lang}`) {
    const role = await getRole(request);
    if (role === 'admin') {
      request.nextUrl.pathname = `/${lang}/dashboard`;
      return NextResponse.redirect(request.nextUrl);
    }
    if (role === 'client') {
      request.nextUrl.pathname = `/${lang}/profile`;
      return NextResponse.redirect(request.nextUrl);
    }
    return;
  }

  // Protect dashboard — only admin
  if (pathname.startsWith(`/${lang}/dashboard`)) {
    const role = await getRole(request);
    if (!role) {
      request.nextUrl.pathname = `/${lang}/sign-in`;
      return NextResponse.redirect(request.nextUrl);
    }
    if (role !== 'admin') {
      request.nextUrl.pathname = `/${lang}/profile`;
      return NextResponse.redirect(request.nextUrl);
    }
    return;
  }

  // Protect profile — only client
  if (pathname.startsWith(`/${lang}/profile`)) {
    const role = await getRole(request);
    if (!role) {
      request.nextUrl.pathname = `/${lang}/sign-in`;
      return NextResponse.redirect(request.nextUrl);
    }
    if (role !== 'client') {
      request.nextUrl.pathname = `/${lang}/dashboard`;
      return NextResponse.redirect(request.nextUrl);
    }
    return;
  }

  return;
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)).*)',
  ],
};
