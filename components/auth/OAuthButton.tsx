'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabaseBrowser';
import { toast } from 'sonner';
import type { Provider } from '@supabase/supabase-js';

type Props = {
  provider?: Provider;
  children?: React.ReactNode;
  redirectTo?: string;
  className?: string;
  variant?: 'outline' | 'default' | 'ghost' | 'secondary';
};

function GitHubIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.29 3.438 9.77 8.205 11.36.6.11.82-.26.82-.58 0-.29-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.082-.73.082-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.76-1.605-2.665-.305-5.466-1.333-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.304-.535-1.527.117-3.176 0 0 1.008-.323 3.3 1.23.958-.266 1.984-.399 3.004-.404 1.02.005 2.047.138 3.006.404 2.29-1.553 3.296-1.23 3.296-1.23.655 1.65.245 2.873.12 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.805 5.62-5.477 5.92.43.37.813 1.1.813 2.22 0 1.606-.015 2.903-.015 3.296 0 .32.216.694.825.576C20.565 22.27 24 17.79 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

export default function OAuthButton({
  provider = 'github',
  children,
  redirectTo,
  className,
  variant = 'outline',
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
        },
      });
      // the flow will redirect to GitHub / Supabase; no further client action here
    } catch (err: unknown) {
      console.error('OAuth signIn error', err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Login failed';
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      aria-label={`Sign in with ${provider}`}
    >
      {loading ? (
        <>
          <Spinner className="mr-2" /> {children ?? `Continue with ${provider}`}
        </>
      ) : (
        <>
          <GitHubIcon className="mr-2 size-4" />{' '}
          {children ?? `Continue with ${provider}`}
        </>
      )}
    </Button>
  );
}
