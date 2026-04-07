'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError || !profile) {
        setError("User profile not found in database.");
        setIsLoading(false);
        await supabase.auth.signOut();
        return;
      }
    }

    router.push('/home');
    router.refresh();
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user user:email'
      },
    })
    if (error) {
      setError('GitHub sign in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8 flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 mb-4 relative overflow-hidden">
             <Image src="/logo.png" alt="MilkGuard Logo" width={80} height={80} style={{ objectFit: 'contain' }} priority />
          </div>
          <h2 className="text-2xl font-bold text-[#60A5FA] mb-8">MilkGuard</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="space-y-1">
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-500 px-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 px-1">{errors.password.message}</p>
              )}
            </div>

            <div className="text-right">
              <Link href="#" className="text-xs font-semibold text-[#60A5FA] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#F5A623] hover:bg-[#E09512] text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-amber-100"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center mt-2">{error}</p>
            )}

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="space-y-3">
              <GoogleSignInButton redirectTo="/home" />

              <Button
                type="button"
                variant="outline"
                onClick={handleGithubLogin}
                className="w-full h-14 bg-white border-slate-200 text-slate-600 font-bold rounded-full flex items-center justify-center gap-3 transition-all hover:bg-slate-50"
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with GitHub
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500 pt-4">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#60A5FA] font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
