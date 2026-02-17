import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import SignUpForm from '@/components/auth/SignUpForm';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function SignUpPage({ params }: PageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.SignUpPage;

  return <SignUpForm lang={lang} t={t} />;
}
