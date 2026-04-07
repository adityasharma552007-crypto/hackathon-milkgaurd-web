'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase/authUtils';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
}

export function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className || ''}`}
    >
      <LogOut size={16} />
      <span>Sign out</span>
    </Button>
  );
}
