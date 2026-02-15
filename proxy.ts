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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon\\.ico|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)).*)',
  ],
};
