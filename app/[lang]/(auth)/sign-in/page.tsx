import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import SignInForm from '@/components/auth/SignInForm';
import SessionHandler from '@/components/auth/SessionHandler';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function SignInPage({ params }: PageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.SignInPage;

  return (
    <>
      <SessionHandler lang={lang} />
      <SignInForm lang={lang} t={t} />
    </>
  );
}
