'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabaseBrowser';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  lang: string;
  t: Record<string, string>;
};

export default function SignInForm({ lang, t }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // debug: log backend response for easier troubleshooting
      console.debug('supabase.auth.signInWithPassword ->', { data, error });

      if (error) {
        console.error('SignIn error', error);
        setLoading(false);
        const status =
          typeof (error as { status?: unknown })?.status === 'number'
            ? (error as { status: number }).status
            : undefined;

        const rawMsg =
          typeof (error as { message?: unknown })?.message === 'string'
            ? (error as { message: string }).message
            : '';

        const authLike =
          status === 400 ||
          status === 401 ||
          /invalid|credentials|password|user/i.test(rawMsg);

        if (status === 429) {
          toast.error(t.tooManyRequests);
        } else if (authLike) {
          toast.error(t.invalidCredentials);
        } else {
          toast.error(rawMsg || t.signInFailed);
        }

        return;
      }

      // Client SSR flow (no server endpoint): refresh to let middleware pick up session
      // and perform role-based redirect server-side. This relies on `@supabase/ssr` to
      // synchronize the client session for SSR.
      toast.success(t.signInSuccess);
      try {
        // trigger server revalidation / middleware run
        router.refresh();
      } catch (err) {
        console.error('router.refresh failed', err);
      }

      // as a UX fallback, navigate to profile — middleware will redirect if needed
      router.push(`/${lang}/profile`);
    } catch (err: unknown) {
      const msg =
        typeof (err as { message?: unknown })?.message === 'string'
          ? (err as { message: string }).message
          : '';
      const fallback = /400|invalid|credentials|password|user/i.test(msg)
        ? t.invalidCredentials
        : t.signInFailed;
      toast.error(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t.description}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">{t.emailLabel}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">{t.passwordLabel}</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {/* errors and messages are shown via Sonner toasts */}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="mr-2" />
                {t.submitButton}
              </>
            ) : (
              t.submitButton
            )}
          </Button>
        </Field>
        <FieldSeparator className="pt-2">{t.orContinueWith}</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            {t.loginWithGithub}
          </Button>
          <FieldDescription className="text-center">
            {t.noAccount}{' '}
            <Link href={`/${lang}/sign-up`} className="underline">
              {t.signUp}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
