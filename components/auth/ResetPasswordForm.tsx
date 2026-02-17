'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabaseBrowser';

type Props = {
  lang: string;
  t: Record<string, string>;
};

export default function ResetPasswordForm({ lang, t }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // client-side validation: passwords must match
    if (password !== confirmPassword) {
      toast.error(t.confirmPasswordMismatch || 'Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(
          error.message || t.resetFailed || 'Failed to update password',
        );
        return;
      }

      toast.success(t.resetSuccess || 'Password updated');

      // redirect to sign-in (middleware will route by locale/role)
      router.push(`/${lang}/auth/sign-in`);
    } catch (err: unknown) {
      const msg =
        typeof (err as { message?: unknown })?.message === 'string'
          ? (err as { message: string }).message
          : t.resetFailed || 'Failed to update password';
      toast.error(msg);
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
          <FieldLabel htmlFor="password">{t.passwordLabel}</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">
            {t.confirmPasswordLabel || 'Confirm password'}
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            placeholder={t.confirmPasswordPlaceholder || '••••••••'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          {confirmPassword.length > 0 && password !== confirmPassword ? (
            <FieldDescription className="text-destructive text-sm">
              {t.confirmPasswordMismatch || 'Passwords do not match'}
            </FieldDescription>
          ) : null}
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={
              loading || password.length < 8 || password !== confirmPassword
            }
          >
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
      </FieldGroup>
    </form>
  );
}
