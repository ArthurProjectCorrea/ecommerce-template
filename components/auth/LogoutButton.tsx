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
  lang: string;
  label?: string;
  toastMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    try {
      await fetch(`/api/auth/session?lang=${lang}`, { method: 'DELETE' });
    } catch {
      /* ignore */
    }
    toast.success(toastMessage || 'Signed out');
    setLoading(false);
    router.push(`/${lang}/sign-in`);
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
