import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get('sb-access-token')?.value;
  if (!access_token) return NextResponse.json({ role: null }, { status: 401 });

  try {
    const payload = access_token.split('.')[1];
    const json = Buffer.from(
      payload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');
    const parsed = JSON.parse(json || '{}');
    const userId = parsed.sub as string | undefined;

    if (!userId) return NextResponse.json({ role: null }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin)
      return NextResponse.json({ role: null }, { status: 500 });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .limit(1)
      .single();

    if (error) return NextResponse.json({ role: null }, { status: 200 });

    return NextResponse.json({ role: data?.role ?? null });
  } catch {
    return NextResponse.json({ role: null }, { status: 200 });
  }
}
