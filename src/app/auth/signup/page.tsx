'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Eye, EyeOff, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { signInWithGithub } from '@/lib/supabase/authUtils';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^\d+$/, 'Numbers only'),
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [strength, setStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    let displayScore = 0;
    if (password.length > 0) {
      if (password.length >= 8) displayScore += 25;
      if (/[A-Z]/.test(password)) displayScore += 25;
      if (/[0-9]/.test(password)) displayScore += 25;
      if (/[^A-Za-z0-9]/.test(password) || password.length > 12) displayScore += 25;
    }
    setStrength(displayScore);
  }, [password]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    setSubmittedEmail(values.email);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // If user created, ensure public.profiles row exists
      if (authData?.user) {
        await supabase.from('profiles').upsert([{
          id: authData.user.id,
          full_name: values.fullName,
          phone: values.phone,
          city: 'Jaipur',
          role: 'consumer'
        }]).select();
      }

      // If email confirmation is enabled on Supabase, no session is created yet
      if (authData?.user && !authData?.session) {
        setIsSuccess(true);
        setIsLoading(false);
        return;
      }

      // If session is immediately active
      if (authData?.session) {
        document.cookie = "mg_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/home');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to create account. Please check your network connection.');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    try {
      await signInWithGithub('/home');
    } catch (err: any) {
      setError(err?.message || 'GitHub sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4 py-12">
      <Card className="w-full max-w-[400px] border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8 flex flex-col items-center">
          <Link href="/auth/login" className="self-start text-slate-400 mb-4 hover:text-[#60A5FA]">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="w-20 h-20 mb-4 relative overflow-hidden">
             <Image src="/logo.png" alt="MilkGuard Logo" width={80} height={80} style={{ objectFit: 'contain' }} priority />
          </div>
          <h2 className="text-2xl font-bold text-[#60A5FA] mb-4">Create Account</h2>

          {isSuccess ? (
            <div className="w-full text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Check Your Email</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We sent a verification link to <span className="font-semibold text-slate-900">{submittedEmail}</span>.
                Please click the link in your email to activate your account.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full h-12 bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-sm rounded-full transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="space-y-1">
                <Input
                  {...register('fullName')}
                  placeholder="Your full name"
                  className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 px-1">{errors.fullName.message}</p>
                )}
              </div>

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

              <div className="space-y-1">
                <Input
                  {...register('phone')}
                  placeholder="10-digit mobile number"
                  className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 px-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1 relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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
                
                {/* Strength Bar */}
                <div className="pt-2 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strength</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        strength <= 25 ? "bg-red-500" : strength <= 75 ? "bg-amber-500" : "bg-green-500"
                      )}
                      style={{ width: `${strength}%` }}
                     />
                  </div>
                </div>
                
                {errors.password && (
                  <p className="text-xs text-red-500 px-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                  className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 px-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-base rounded-full transition-all shadow-md mt-4"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </Button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="space-y-3">
                <GoogleSignInButton buttonText="Sign up with Google" />

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
                  <span>Continue with GitHub</span>
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-semibold mt-2">
                  <Shield size={14} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-center text-sm text-slate-500 pt-4">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#00668a] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
