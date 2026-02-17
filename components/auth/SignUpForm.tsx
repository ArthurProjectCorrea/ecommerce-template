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
import { Spinner } from '@/components/ui/spinner';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { createClient } from '@/lib/supabaseBrowser';

type Props = {
  lang: string;
  t: Record<string, string>;
};

export default function SignUpForm({ lang, t }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      // Cria o usuário e envia email de confirmação via Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${lang}/auth/sign-in`,
          data: { name },
        },
      });
      if (error) {
        toast.error(error.message || 'Signup failed');
        setLoading(false);
        return;
      }
      // Exibe alerta de email enviado e toast de sucesso
      toast.success(t.emailSentTitle);
      setShowDialog(true);
    } catch (err: unknown) {
      const m =
        typeof (err as { message?: unknown })?.message === 'string'
          ? (err as { message: string }).message
          : 'Signup failed';
      toast.error(m);
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
            <FieldLabel htmlFor="name">{t.nameLabel}</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
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
            <FieldLabel htmlFor="password">{t.passwordLabel}</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FieldDescription>{t.passwordDescription}</FieldDescription>
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
          <FieldSeparator>{t.orContinueWith}</FieldSeparator>
          <Field>
            <Button variant="outline" type="button">
              {t.signUpWithGithub}
            </Button>
            <FieldDescription className="px-6 text-center">
              {t.alreadyHaveAccount}{' '}
              <Link href={`/${lang}/auth/sign-in`}>{t.signIn}</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
      {/* AlertDialog de email enviado */}
      <EmailSentDialog
        open={showDialog}
        email={email}
        t={t}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) router.replace(`/${lang}/auth/sign-in`);
        }}
      />
    </>
  );
}

// Componente de AlertDialog para email enviado
function EmailSentDialog({
  open,
  email,
  t,
  onOpenChange,
}: {
  open: boolean;
  email: string;
  t: Record<string, string>;
  onOpenChange: (open: boolean) => void;
}) {
  const description = t.emailSentDescription?.replace('{email}', email) || '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.emailSentTitle}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{t.emailSentOk}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
