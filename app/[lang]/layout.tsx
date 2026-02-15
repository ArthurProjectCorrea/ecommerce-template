import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import TopLoader from '@/components/top-loader';
import { locales } from '@/lib/i18n';
import { getDictionary, hasLocale } from './dictionaries';

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.LangLayout.title,
    description: dict.LangLayout.description,
  };
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TopLoader />
      {children}
    </ThemeProvider>
  );
}
