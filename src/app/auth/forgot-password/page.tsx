'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://hackathon-milkgaurd-web.vercel.app');
      const redirectUrl = `${origin}/auth/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setSentEmail(values.email);
      setIsSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#001d36] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border border-[#d1e4ff] ambient-shadow rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6 sm:p-8 flex flex-col items-center">
          
          <Link href="/auth/login" className="self-start flex items-center gap-1.5 text-xs font-bold text-[#6e7980] hover:text-[#00668a] mb-6 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>

          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00668a] to-[#004c69] flex items-center justify-center text-white shadow-md mb-4">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold text-[#001d36]">Reset Password</h1>
            <p className="text-xs font-semibold text-[#3e484f] mt-1">
              Enter your registered email address to receive a secure recovery link.
            </p>
          </div>

          {isSuccess ? (
            <div className="w-full text-center space-y-4 py-3 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-base font-extrabold text-slate-800">Check Your Email</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent a password recovery link to{' '}
                <span className="font-bold text-slate-900">{sentEmail}</span>.
                Click the link in your email to choose a new password.
              </p>
              <div className="pt-4 space-y-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full h-12 bg-[#00668a] hover:bg-[#004c69] text-white font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="w-full py-2 text-xs text-[#6e7980] hover:text-[#001d36] font-semibold transition-colors"
                >
                  Didn&apos;t get it? Try another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#001d36] px-1">Email Address</label>
                <div className="relative">
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="your@email.com"
                    className="h-12 bg-[#f8f9ff] border-[#d1e4ff] text-xs font-semibold text-[#001d36] focus:border-[#00668a] rounded-xl pr-10"
                    disabled={isLoading}
                  />
                  <Mail size={18} className="absolute right-3.5 top-3.5 text-[#6e7980] pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#ba1a1a] px-1 font-medium">{errors.email.message}</p>
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
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Send Recovery Link'}
              </Button>

              <p className="text-center text-xs text-[#3e484f] font-semibold pt-4">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-[#00668a] font-extrabold hover:underline">
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
