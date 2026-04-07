export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider: 'google' | 'email';
  created_at: string;
};
