import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function ResetPasswordPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.ResetPasswordPage ?? {
    title: 'Set a new password',
    description: 'Choose a strong password to secure your account.',
  };

  return <ResetPasswordForm lang={lang} t={t} />;
}
