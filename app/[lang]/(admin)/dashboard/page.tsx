import LogoutButton from '@/components/auth/LogoutButton';

type PageProps = Readonly<{
  params: Promise<{ lang: string }>;
}>;

export default async function DashboardPage({ params }: PageProps) {
  const { lang } = await params;

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <LogoutButton lang={lang} />
      </div>
      <p className="text-muted-foreground">Welcome to the admin area.</p>
    </main>
  );
}
