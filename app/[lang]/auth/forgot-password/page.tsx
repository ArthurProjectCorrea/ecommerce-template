import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function ForgotPasswordPage({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.ForgotPasswordPage ?? {
    title: 'Reset your password',
    description: "Enter your email and we'll send a reset link.",
  };

  return <ForgotPasswordForm lang={lang} t={t} />;
}
