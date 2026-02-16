'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
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
    await supabase.auth.signOut();
    try {
      // forward the lang param if available, otherwise default to 'en'
      const targetLang = lang || (await import('@/lib/i18n')).defaultLocale;
      await fetch(`/api/auth/session?lang=${targetLang}`, { method: 'DELETE' });
      toast.success(toastMessage || 'Signed out');
      router.push(`/${targetLang}/sign-in`);
    } catch (err) {
      // fallback to root sign-in if anything goes wrong
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
