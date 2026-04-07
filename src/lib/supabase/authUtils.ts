import { createClient } from './client';

/**
 * Initiates the Google OAuth sign-in flow.
 * Note: Provide an absolute redirect URL if necessary, else Supabase uses its default site url configuration.
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient();
  const redirectUrl = redirectTo 
    ? `${window.location.origin}${redirectTo}`
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

/**
 * Signs the current user out.
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Gets the current user session (client side).
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
