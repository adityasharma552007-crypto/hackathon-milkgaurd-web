'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase/authUtils';

interface GoogleSignInButtonProps {
  buttonText?: string;
  className?: string;
  redirectTo?: string;
}

export function GoogleSignInButton({ 
  buttonText = 'Sign in with Google', 
  className,
  redirectTo
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Authentication');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center flex-col">
      <Button
        type="button"
        variant="outline"
        onClick={handleSignIn}
        disabled={isLoading}
        className={`w-full h-14 bg-white border-slate-200 text-slate-600 font-bold rounded-full flex items-center justify-center gap-3 transition-all hover:bg-slate-50 ${className || ''}`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {buttonText}
      </Button>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
