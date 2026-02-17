import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import SignInForm from '@/components/auth/SignInForm';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function SignInPage({ params }: PageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.SignInPage;

  return <SignInForm lang={lang} t={t} />;
}
