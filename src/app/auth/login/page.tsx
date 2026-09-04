'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Eye, EyeOff, Loader2, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { signInWithGithub } from '@/lib/supabase/authUtils';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read status messages from query params
  const paramError = searchParams.get('error');
  const paramReset = searchParams.get('reset');
  const paramLoggedOut = searchParams.get('logged_out');
  const paramVerified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const setDemoSessionCookie = () => {
    document.cookie = "mg_demo_session=true; path=/; max-age=604800; SameSite=Lax";
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    // If explicit demo login requested
    if (values.email === 'demo@milkguard.com') {
      setDemoSessionCookie();
      router.push('/home');
      router.refresh();
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (authData?.user) {
        // Ensure profiles table has this user
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert([{
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'MilkGuard User',
            city: 'Jaipur',
            role: 'consumer'
          }]).select();
        }
      }

      // Ensure demo session cookie is cleared for authentic Supabase session
      document.cookie = "mg_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      router.push('/home');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setValue('email', 'demo@milkguard.com');
    setValue('password', 'password123');
    setDemoSessionCookie();
    router.push('/home');
    router.refresh();
  };

  const handleGithubLogin = async () => {
    setError(null);
    try {
      await signInWithGithub('/home');
    } catch (err: any) {
      setError(err?.message || 'Unable to initialize GitHub OAuth.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#001d36] flex flex-col items-center justify-center p-4">
      {/* Container Card */}
      <Card className="w-full max-w-md border border-[#d1e4ff] ambient-shadow rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00668a] to-[#004c69] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-3xl">biotech</span>
            </div>
            <span className="text-2xl font-black text-[#00288e] tracking-tight">MilkGuard</span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold text-[#001d36]">Welcome Back</h1>
            <p className="text-xs font-semibold text-[#3e484f] mt-1">Sign in to view your spectral scans & safety reports</p>
          </div>

          {/* Status Banners from Query Params */}
          {paramReset === 'success' && (
            <div className="w-full mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Password reset successful! Please sign in with your new password.</span>
            </div>
          )}

          {paramLoggedOut === 'true' && (
            <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs text-blue-800 font-semibold animate-in fade-in">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
              <span>You have been signed out successfully.</span>
            </div>
          )}

          {paramVerified === 'true' && (
            <div className="w-full mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Email verified! You can now sign in to your account.</span>
            </div>
          )}

          {paramError && (
            <div className="w-full mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-semibold animate-in fade-in">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>{paramError}</span>
            </div>
          )}

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full mb-6 p-3 bg-[#e5efff] hover:bg-[#c4e7ff] border border-[#c4e7ff] text-[#00668a] rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Sparkles size={16} className="text-[#30c5b3]" />
            <span>Click for Quick Demo Sign In</span>
            <ArrowRight size={14} />
          </button>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#001d36] px-1">Email Address</label>
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="h-12 bg-[#f8f9ff] border-[#d1e4ff] text-xs font-semibold text-[#001d36] focus:border-[#00668a] rounded-xl"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-[#ba1a1a] px-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#001d36]">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#00668a] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
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

            <Button
              type="submit"
              className="w-full h-12 bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#00668a]/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            </Button>

            {error && (
              <div className="p-3 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-xl flex items-start gap-2 text-xs text-[#ba1a1a] font-semibold mt-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-[#d1e4ff]"></div>
              <span className="flex-shrink mx-4 text-[10px] text-[#6e7980] font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-[#d1e4ff]"></div>
            </div>

            <div className="space-y-3">
              <GoogleSignInButton buttonText="Continue with Google" />

              <Button
                type="button"
                variant="outline"
                onClick={handleGithubLogin}
                className="w-full h-12 bg-white border-[#d1e4ff] text-[#001d36] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#f8f9ff] transition-all"
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Continue with GitHub</span>
              </Button>
            </div>

            <p className="text-center text-xs text-[#3e484f] font-semibold pt-4">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#00668a] font-extrabold hover:underline">
                Sign up free
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00668a]" size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
