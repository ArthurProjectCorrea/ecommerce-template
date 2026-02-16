import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries';
import { headers } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import LogoutButton from '@/components/auth/LogoutButton';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function DashboardPage({ params }: PageProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.Dashboard;

  const cookieHeader = (await headers()).get('cookie') || '';

  const getCookie = (name: string) => {
    const match = cookieHeader.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  };

  const token = getCookie('sb-access-token');

  if (!token) return notFound();

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return notFound();

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return notFound();

  const user = data.user;
  const metadata = (user.user_metadata ?? null) as Record<
    string,
    unknown
  > | null;
  const name =
    metadata && typeof metadata.name === 'string'
      ? metadata.name
      : (user.email ?? 'User');
  const welcomeText = t.welcome.replace('{name}', String(name));

  return (
    <div className="min-h-svh flex items-center justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-md bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">{welcomeText}</h1>
        <LogoutButton lang={lang} label={t.logout} toastMessage={t.signedOut} />
      </div>
    </div>
  );
}
