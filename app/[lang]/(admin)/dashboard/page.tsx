import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;

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
