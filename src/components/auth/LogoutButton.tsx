'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase/authUtils';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
}

export function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      window.location.href = '/auth/login?logged_out=true';
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className || ''}`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      <span>Sign out</span>
    </Button>
  );
}

