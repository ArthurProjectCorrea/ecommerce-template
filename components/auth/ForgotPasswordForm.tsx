'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabaseBrowser';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type Props = {
  lang: string;
  t: Record<string, string>;
};

export default function ForgotPasswordForm({ lang, t }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${lang}/auth/reset-password`,
      });

      if (error) {
        toast.error(
          error.message || t.forgotPasswordFailed || 'Request failed',
        );
        return;
      }

      toast.success(t.emailSentTitle || 'Email sent');
      setShowDialog(true);
    } catch (err: unknown) {
      const msg =
        typeof (err as { message?: unknown })?.message === 'string'
          ? (err as { message: string }).message
          : t.forgotPasswordFailed || 'Request failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <FieldDescription>{t.emailDescription}</FieldDescription>
          </Field>

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
        </FieldGroup>
      </form>
      <AlertDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) router.replace(`/${lang}/auth/sign-in`);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.emailSentTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {(
                t.emailSentDescription || "We've sent a reset link to {email}."
              ).replace('{email}', email)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t.emailSentOk || 'OK'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* close -> go to localized sign-in under /auth */}
      {/* (keeps behavior consistent after moving auth into /auth) */}{' '}
    </>
  );
}
