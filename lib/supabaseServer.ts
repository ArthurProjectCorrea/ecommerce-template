import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

// Wrap Next.js cookie APIs to the shape expected by @supabase/ssr
interface CookieEntry {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

interface NextCookieStore {
  getAll: () => CookieEntry[];
  set?: (
    name: string,
    value: string,
    options?: Record<string, unknown>,
  ) => void;
}

function wrapServerCookies(store: NextCookieStore) {
  return {
    getAll() {
      // Next's RequestCookies/ResponseCookies implement getAll()
      return store.getAll();
    },
    setAll(cookiesToSet: CookieEntry[]) {
      // If running in a server component / API route, `cookies()` exposes `set`
      if (typeof store.set === 'function') {
        cookiesToSet.forEach(({ name, value, options }) =>
          store.set!(name, value, options),
        );
      } else {
        // In contexts where `store.set` doesn't exist (e.g. NextRequest.cookies),
        // setAll is a no-op here — middleware must provide its own setAll.
      }
    },
  } as const;
}

// createClient: usable from server components and API routes.
// For middleware, prefer calling createServerClient directly with a
// cookies object that uses request.cookies.getAll() and response.cookies.set().
export const createClient = (cookieStore?: NextCookieStore) => {
  const store = (cookieStore ?? nextCookies()) as NextCookieStore;
  type SupabaseOpts = Parameters<typeof createServerClient>[2];

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: wrapServerCookies(store) as unknown as SupabaseOpts['cookies'] },
  );
};
