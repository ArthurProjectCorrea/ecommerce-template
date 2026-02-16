'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionHandler({ lang }: { lang: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleHash = async () => {
      try {
        const hash =
          typeof window !== 'undefined'
            ? window.location.hash.replace(/^#/, '')
            : '';
        if (!hash) {
          return;
        }

        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        // clear hash from URL
        if (typeof window !== 'undefined') {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, document.title, cleanUrl);
        }

        if (access_token) {
          await fetch(`/api/auth/session?lang=${lang}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
          });

          router.replace(`/${lang}/dashboard`);
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
