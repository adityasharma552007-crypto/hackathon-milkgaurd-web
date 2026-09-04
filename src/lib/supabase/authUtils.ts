import { createClient } from './client';

/**
 * Initiates the Google OAuth sign-in flow.
 * Directs through /auth/callback so PKCE exchange and session cookies are set correctly.
 */
export async function signInWithGoogle(nextRoute: string = '/home') {
  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
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
 * Initiates the GitHub OAuth sign-in flow.
 * Directs through /auth/callback so PKCE exchange and session cookies are set correctly.
 */
export async function signInWithGithub(nextRoute: string = '/home') {
  const supabase = createClient();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: callbackUrl,
      scopes: 'read:user user:email',
    },
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

import { useUserStore } from '@/store/useUserStore';

/**
 * Signs the current user out across server cookies, Supabase client session,
 * Zustand user store, document cookies, and browser storage.
 */
export async function signOut() {
  const supabase = createClient();

  // 1. Terminate server-side session and clear HTTP cookies
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('Server-side logout call warning:', err);
  }

  // 2. Clear Supabase auth session on client
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Global signOut error, falling back to local signOut:', error);
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    }
  } catch (err) {
    try {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    } catch {}
  }

  // 3. Clear Zustand client user state
  try {
    useUserStore.getState().clearUser();
  } catch (err) {
    console.warn('Failed to clear Zustand user store:', err);
  }

  // 4. Manually clear client-accessible cookies as defense-in-depth
  if (typeof document !== 'undefined') {
    const expireStr = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = `mg_demo_session=; ${expireStr}; SameSite=Lax`;
    document.cookie = `mg_demo_session=; ${expireStr}`;
    document.cookie = `mg_demo_session=; max-age=0; path=/; SameSite=Lax`;
    document.cookie = `mg_demo_session=; max-age=0; path=/`;

    // Clear any Supabase cookies
    const rawCookies = document.cookie.split(';');
    for (const c of rawCookies) {
      const eqPos = c.indexOf('=');
      const name = (eqPos > -1 ? c.substring(0, eqPos) : c).trim();
      if (name.startsWith('sb-') || name.includes('auth') || name.includes('session')) {
        document.cookie = `${name}=; ${expireStr}; SameSite=Lax`;
        document.cookie = `${name}=; ${expireStr}`;
        document.cookie = `${name}=; max-age=0; path=/`;
      }
    }
  }

  // 5. Clear localStorage and sessionStorage tokens
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth') || key.includes('session') || key.includes('milkguard'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth') || key.includes('session') || key.includes('milkguard'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
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
