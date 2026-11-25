"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@trackmate.app',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: '',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as SupabaseUser;

const IS_AUTH_FROZEN = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

interface UseAuthReturn {
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(IS_AUTH_FROZEN ? DEMO_USER : null);
  const [loading, setLoading] = useState<boolean>(!IS_AUTH_FROZEN);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (IS_AUTH_FROZEN) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (IS_AUTH_FROZEN) {
        setUser({ ...DEMO_USER, email, user_metadata: { full_name: fullName, avatar_url: '' } } as SupabaseUser);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign-up failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (IS_AUTH_FROZEN) {
        setUser({ ...DEMO_USER, email } as SupabaseUser);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign-in failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signOut = useCallback(async () => {
    if (IS_AUTH_FROZEN) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-out failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPassword = useCallback(
    async (email: string) => {
      if (IS_AUTH_FROZEN) return;
      setLoading(true);
      setError(null);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: `${window.location.origin}/auth/callback?next=/settings` }
        );
        if (resetError) throw resetError;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Password reset failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      if (IS_AUTH_FROZEN) return;
      setLoading(true);
      setError(null);
      try {
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Password update failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { user, loading, error, signUp, signIn, signOut, resetPassword, updatePassword };
}
