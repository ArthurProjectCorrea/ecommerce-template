'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionHandler({ lang }: { lang: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleHash = async () => {
      try {
        // Accept tokens either in hash (OAuth / magic-link) or in query (some Supabase redirects)
        const hash =
          typeof window !== 'undefined'
            ? window.location.hash.replace(/^#/, '')
            : '';
        const search =
          typeof window !== 'undefined'
            ? window.location.search.replace(/^\?/, '')
            : '';

        const params = new URLSearchParams(hash || search);
        const access_token =
          params.get('access_token') || params.get('accessToken') || null;
        const refresh_token =
          params.get('refresh_token') || params.get('refreshToken') || null;

        // If Supabase redirected back with `type=signup` we can optionally show a toast
        const qs = new URLSearchParams(search);
        const type = qs.get('type');

        // clear hash/query tokens from URL
        if (typeof window !== 'undefined') {
          const cleanUrl = window.location.pathname; // keep searchless
          window.history.replaceState(null, document.title, cleanUrl);
        }

        // If tokens present, persist them server-side and redirect by role
        if (access_token) {
          const res = await fetch(`/api/auth/session?lang=${lang}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
          });

          const json = await res.json().catch(() => ({}));
          const role = (json?.role as string) || 'client';
          router.replace(
            role === 'admin' ? `/${lang}/dashboard` : `/${lang}/profile`,
          );
          return;
        }

        // If redirected after signup/confirmation show a Sonner success message
        const confirmationPresent =
          type === 'signup' ||
          qs.has('confirmation_token') ||
          qs.has('confirmed') ||
          qs.get('status') === 'confirmed' ||
          qs.get('verified') === 'true';

        if (confirmationPresent) {
          import('sonner').then(({ toast }) =>
            toast.success('Email confirmado — faça login.'),
          );
          return;
        }
      } catch (err) {
        // ignore and allow user to login manually
        console.error('SessionHandler error', err);
      }
    };

    handleHash();
  }, [lang, router]);

  return null;
}
