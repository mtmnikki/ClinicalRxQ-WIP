import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Account } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  account: Account | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for an active session on initial load
    const getInitialData = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const { data: accountData } = await supabase
          .from('accounts')
          .select('*')
          .eq('account_id', initialSession.user.id)
          .single();
        if (accountData) setAccount(accountData as Account);
      }
      setIsLoading(false);
    };

    getInitialData();

    // Listen for changes in authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setIsLoading(true);
          const { data: accountData } = await supabase
            .from('accounts')
            .select('*')
            .eq('account_id', newSession.user.id)
            .single();
          if (accountData) setAccount(accountData as Account);
          setIsLoading(false);
        } else {
          setAccount(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    account,
    isLoading,
    signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
    signOut: async () => {
      await supabase.auth.signOut();
      setAccount(null);
    },
  };

  // Render children only after the initial auth check is complete
  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

