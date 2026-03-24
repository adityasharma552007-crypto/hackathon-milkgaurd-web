'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
    } else {
      router.push('/home')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8 flex flex-col items-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-[#1A6B4A] rounded-full flex items-center justify-center mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1A6B4A] mb-8">MilkGuard</h2>

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
              <Link href="#" className="text-xs font-semibold text-[#1A6B4A] hover:underline">
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

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-white border-slate-200 text-slate-600 font-bold rounded-full flex items-center justify-center gap-3 transition-all hover:bg-slate-50"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-slate-500 pt-4">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#1A6B4A] font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
