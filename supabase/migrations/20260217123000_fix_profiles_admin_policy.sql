-- Fix for RLS recursion on public.profiles admin policy
-- Creates a SECURITY DEFINER helper and replaces the policy to avoid
-- selecting from `public.profiles` inside a policy (which causes recursion).

-- Create helper function (security definer so it bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Replace admin policy to use the helper function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Admin can access all profiles'
  ) THEN
    DROP POLICY "Admin can access all profiles" ON public.profiles;
  END IF;
END
$$;

CREATE POLICY "Admin can access all profiles"
  ON public.profiles
  FOR ALL
  USING ( public.is_current_user_admin() );
