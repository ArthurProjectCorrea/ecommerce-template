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
import { supabase } from '@/lib/supabase';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If supabase returns an error object, show a generic auth error (do not reveal existence)
      if (error) {
        setLoading(false);
        const status =
          typeof (error as { status?: unknown })?.status === 'number'
            ? (error as { status: number }).status
            : undefined;
        const authLike =
          status === 400 ||
          status === 401 ||
          /invalid|credentials|password|user/i.test(
            ((error as { message?: unknown })?.message as string) || '',
          );

        if (status === 429) {
          toast.error(t.tooManyRequests);
        } else if (authLike) {
          toast.error(t.invalidCredentials);
        } else {
          const msg =
            typeof (error as { message?: unknown })?.message === 'string'
              ? (error as { message: string }).message
              : t.signInFailed;
          toast.error(msg);
        }
        return;
      }

      // set httpOnly cookie on server
      try {
        const access_token = data.session?.access_token;
        const refresh_token = data.session?.refresh_token;
        if (access_token) {
          const res = await fetch(`/api/auth/session?lang=${lang}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            toast.error(json?.error || t.signInFailed);
            setLoading(false);
            return;
          }
        }

        toast.success(t.signInSuccess);
        router.push(`/${lang}/dashboard`);
      } catch (err: unknown) {
        const m =
          typeof (err as { message?: unknown })?.message === 'string'
            ? (err as { message: string }).message
            : t.signInFailed;
        toast.error(m);
      } finally {
        setLoading(false);
      }
    } catch (err: unknown) {
      // network / unexpected error -> show generic auth message
      const msg =
        typeof (err as { message?: unknown })?.message === 'string'
          ? (err as { message: string }).message
          : '';
      const fallback = /400|invalid|credentials|password|user/i.test(msg)
        ? t.invalidCredentials
        : t.signInFailed;
      toast.error(fallback);
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
