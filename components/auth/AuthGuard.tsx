'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace(`/${lang}/(auth)/sign-in`);
      } else {
        setReady(true);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [lang, router]);

  if (!ready) return null;

  return <>{children}</>;
}
