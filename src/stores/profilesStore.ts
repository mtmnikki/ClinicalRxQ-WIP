import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface Profile {
  id: string;
  profile_id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  npi_number?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

interface ProfilesStore {
  profiles: Profile[];
  currentProfileId: string | null;
  isLoading: boolean;
  error: string | null;
  
  setProfiles: (profiles: Profile[]) => void;
  setCurrentProfileId: (id: string | null) => void;
  fetchProfiles: (accountId: string) => Promise<void>;
  createProfile: (profile: Partial<Profile>) => Promise<Profile>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfilesStore = create<ProfilesStore>((set, get) => ({
  profiles: [],
  currentProfileId: null,
  isLoading: false,
  error: null,
  
  setProfiles: (profiles) => set({ profiles }),
  
  setCurrentProfileId: (id) => {
    set({ currentProfileId: id });
    if (id) {
      localStorage.setItem('currentProfileId', id);
    } else {
      localStorage.removeItem('currentProfileId');
    }
  },
  
  fetchProfiles: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from<Profile>('member_profiles')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const profiles = data || [];
      set({ profiles, isLoading: false });
      
      // Restore selected profile from localStorage
      const savedProfileId = localStorage.getItem('currentProfileId');
      if (savedProfileId && profiles.some(p => p.profile_id === savedProfileId)) {
        set({ currentProfileId: savedProfileId });
      } else if (profiles.length > 0) {
        // Select first profile if no saved selection
        set({ currentProfileId: profiles[0].profile_id });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  createProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from<Profile>('member_profiles')
        .insert([profile])
        .select()
        .single();
      
      if (error) throw error;
      
      const newProfile = data as Profile;
      set((state) => ({
        profiles: [...state.profiles, newProfile],
        isLoading: false,
      }));
      
      return newProfile;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateProfile: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('member_profiles')
        .update(updates)
        .eq('profile_id', id);
      
      if (error) throw error;
      
      set((state) => ({
        profiles: state.profiles.map(p => 
          p.profile_id === id ? { ...p, ...updates } : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('member_profiles')
        .delete()
        .eq('profile_id', id);
      
      if (error) throw error;
      
      set((state) => ({
        profiles: state.profiles.filter(p => p.profile_id !== id),
        currentProfileId: state.currentProfileId === id ? null : state.currentProfileId,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));