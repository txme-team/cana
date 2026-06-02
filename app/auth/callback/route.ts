import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/apply';

  if (code) {
    // We need a mutable response; create a temporary redirect target first.
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData.user) {
      const userId = sessionData.user.id;

      // Check if user already has a profile
      try {
        const serviceClient = createServiceClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (serviceClient as any)
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle() as { data: { id: string } | null };

        if (!profile) {
          // No profile yet — start onboarding flow
          const nudgeResponse = NextResponse.redirect(`${origin}/onboard`);
          // Copy session cookies to the new response
          response.cookies.getAll().forEach(({ name, value, ...opts }) => {
            nudgeResponse.cookies.set(name, value, opts);
          });
          return nudgeResponse;
        }
      } catch {
        // On error, fall through to default redirect
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
