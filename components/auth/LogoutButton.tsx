'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabaseBrowser';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function LogoutButton({
  lang,
  label,
  toastMessage,
}: {
  lang?: string;
  label?: string;
  toastMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      // client-only sign out; SSR cookies are managed by the official SDK
      const targetLang = lang || (await import('@/lib/i18n')).defaultLocale;
      toast.success(toastMessage || 'Signed out');
      router.push(`/${targetLang}/sign-in`);
    } catch (err) {
      console.error('Logout failed', err);
      toast.success(toastMessage || 'Signed out');
      router.push('/sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="ghost" onClick={onLogout}>
      {loading ? (
        <>
          <Spinner className="mr-2" />
          {label ?? 'Logout'}
        </>
      ) : (
        (label ?? 'Logout')
      )}
    </Button>
  );
}
