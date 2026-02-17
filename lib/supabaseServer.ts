import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // `cookies()` is adapted to the shape expected by the SSR helper at runtime
    // cast to `any` to avoid type mismatch between Next's Cookie API and the
    // helper's types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { cookies: cookies() as any },
  );
