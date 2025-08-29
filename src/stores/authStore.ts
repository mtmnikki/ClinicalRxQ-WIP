/**
 * Authentication state management store with real Supabase integration
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authService } from '../services/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: { pharmacyName?: string }) => Promise<boolean>;
  clearUserContext: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * User login function with Supabase
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await authService.signIn(email, password);
          
          if (error) {
            console.error('Login error:', error);
            set({ isLoading: false });
            return false;
          }

          if (data?.user) {
            // Get user profile to create User object
            const account = await authService.getCurrentAccount();
            
            if (account) {
              const user: User = {
                id: account.id,
                email: account.email,
                role: 'authenticated',
                subscription: {
                  status: 'active',
                  startDate: new Date(account.created_at),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  programs: ['mtm-future-today', 'timemymeds', 'test-treat'],
                },
                createdAt: new Date(account.created_at),
              };

              set({ user, isAuthenticated: true, isLoading: false });
              return true;
            }
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * User logout function
       */
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear auth state
        set({ user: null, isAuthenticated: false, isLoading: false });
        
        // Clear account context (will be imported lazily to avoid circular deps)
        get().clearUserContext();
      },

      /**
       * Check if user is authenticated on app start
       */
      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const session = await authService.getSession();
          
          if (session?.user) {
            const account = await authService.getCurrentAccount();
            
            if (account) {
              const user: User = {
                id: account.id,
                email: pharmacy.email,
                role: 'authenticated',
                subscription: {'Active' ? 'active' : 'inactive',
                  startDate: new Date(profile.created_at),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  programs: ['mtm-future-today', 'timemymeds', 'test-treat'],
                },
                createdAt: new Date(account.created_at),
              };

              set({ user, isAuthenticated: true, isLoading: false });
              return;
            }
          }
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },


      /**
       * Clear all user-related context (profiles, bookmarks, etc.)
       * This is called on logout to ensure clean state
       */
      clearUserContext: () => {
        try {
          // Dynamic import to avoid circular dependency
          import('./authStore').then(({ useAuthStore }) => {
            useAuthStore.getState().reset();
          });
        } catch (error) {
          console.warn('Failed to clear account context:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
