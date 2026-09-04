'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    async function checkSession() {
      try {
        // 1. Check if recovery tokens are present in URL hash (#access_token=...&refresh_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashStr = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hashStr);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error: setSessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!setSessionErr && data?.session) {
              setHasValidSession(true);
              setIsVerifying(false);
              return;
            }
          }
        }

        // 2. Check if token_hash or auth code is present in URL search (?token_hash=... or ?code=...)
        if (typeof window !== 'undefined' && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          const tokenHash = searchParams.get('token_hash') || searchParams.get('token');
          if (tokenHash) {
            const { data: vData, error: vErr } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });
            if (!vErr && vData?.session) {
              setHasValidSession(true);
              setIsVerifying(false);
              return;
            }
          }

          const code = searchParams.get('code');
          if (code) {
            const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeErr && data?.session) {
              setHasValidSession(true);
              setIsVerifying(false);
              return;
            }
          }
        }

        // 3. Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
          setIsVerifying(false);
          return;
        }

        // 4. Listen for auth state change event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN') || (session && event === 'USER_UPDATED')) {
            setHasValidSession(true);
            setIsVerifying(false);
          }
        });

        setTimeout(() => {
          setIsVerifying(false);
        }, 1500);

        return () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Session check warning:', err);
        setIsVerifying(false);
      }
    }
    checkSession();
  }, [supabase]);

  const onSubmit = async (values: ResetFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      // Password updated successfully. Clear demo session if any and redirect with success banner
      document.cookie = "mg_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push('/auth/login?reset=success');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please try again.');
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#00668a]" size={36} />
        <p className="text-xs font-semibold text-[#3e484f] mt-3">Verifying recovery session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#001d36] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border border-[#d1e4ff] ambient-shadow rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00668a] to-[#004c69] flex items-center justify-center text-white shadow-md mb-4">
            <Lock size={24} />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold text-[#001d36]">Create New Password</h1>
            <p className="text-xs font-semibold text-[#3e484f] mt-1">
              Choose a strong password to secure your MilkGuard account.
            </p>
          </div>

          {!hasValidSession && (
            <div className="w-full mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 font-semibold">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span>Recovery link may have expired or is invalid. If submission fails, please request a new link.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-[#001d36] px-1">New Password</label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="h-12 bg-[#f8f9ff] border-[#d1e4ff] text-xs font-semibold text-[#001d36] focus:border-[#00668a] rounded-xl pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-[#6e7980] hover:text-[#001d36]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[#ba1a1a] px-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#001d36] px-1">Confirm New Password</label>
              <Input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                className="h-12 bg-[#f8f9ff] border-[#d1e4ff] text-xs font-semibold text-[#001d36] focus:border-[#00668a] rounded-xl"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#ba1a1a] px-1 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-xl flex items-start gap-2 text-xs text-[#ba1a1a] font-semibold">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#00668a]/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Update Password'}
            </Button>

            <div className="text-center pt-3">
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#00668a] hover:underline">
                Request new recovery link
              </Link>
            </div>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00668a]" size={32} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
