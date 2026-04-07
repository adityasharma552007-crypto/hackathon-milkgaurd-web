'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserAvatar } from '@/components/auth/UserAvatar';

const completeProfileSchema = z.object({
  phone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^\d+$/, 'Numbers only'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  role: z.enum(['consumer', 'vendor', 'tester']),
});

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      role: 'consumer',
      city: 'Jaipur',
    }
  });

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        if (profile.profile_complete) {
          router.push('/home'); // Already complete
        } else {
          setUserProfile(profile);
        }
      }
      setIsInitializing(false);
    }
    
    loadSession();
  }, [supabase, router]);

  const onSubmit = async (values: CompleteProfileFormValues) => {
    setIsLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: values.phone,
        city: values.city,
        area: values.area,
        role: values.role,
        profile_complete: true,
      })
      .eq('id', session.user.id);

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
    } else {
      router.push('/home');
      router.refresh();
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#60A5FA]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-[500px] border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#60A5FA]">Complete Your Profile</CardTitle>
          <CardDescription>We just need a few more details to set up your account.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 flex flex-col items-center">
          
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl w-full mb-6">
            <UserAvatar 
              avatarUrl={userProfile?.avatar_url} 
              name={userProfile?.full_name} 
              size={50} 
            />
            <div className="overflow-hidden text-left">
               <p className="font-bold text-slate-800 truncate">{userProfile?.full_name}</p>
               <p className="text-sm text-slate-500 truncate">{userProfile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <Input
                {...register('phone')}
                placeholder="10-digit mobile number"
                className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                disabled={isLoading}
              />
              {errors.phone && <p className="text-xs text-red-500 px-1">{errors.phone.message}</p>}
            </div>

            <div className="flex gap-4">
              <div className="space-y-1 w-1/2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                <Input
                  {...register('city')}
                  placeholder="City"
                  className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                  disabled={isLoading}
                />
                {errors.city && <p className="text-xs text-red-500 px-1">{errors.city.message}</p>}
              </div>

              <div className="space-y-1 w-1/2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Area</label>
                <Input
                  {...register('area')}
                  placeholder="Neighborhood/Area"
                  className="h-12 bg-[#F8FBF9] border-slate-100 rounded-xl"
                  disabled={isLoading}
                />
                {errors.area && <p className="text-xs text-red-500 px-1">{errors.area.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">I am a...</label>
               <select 
                 {...register('role')}
                 className="flex h-12 w-full rounded-xl border-slate-100 bg-[#F8FBF9] px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 disabled={isLoading}
               >
                 <option value="consumer">Consumer (I buy milk)</option>
                 <option value="vendor">Vendor (I sell milk)</option>
                 <option value="tester">Tester / Inspector</option>
               </select>
               {errors.role && <p className="text-xs text-red-500 px-1">{errors.role.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#60A5FA] hover:bg-[#3B82F6] text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-blue-100 mt-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Profile'}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center mt-2">{error}</p>
            )}
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
