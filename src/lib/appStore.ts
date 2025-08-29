import { create } from 'zustand';
import { createClient, Session } from '@supabase/supabase-js';

// --- 1. TYPE DEFINITIONS ---
// UPDATED: Added types for personalization features.

export interface Profile {
  profile_id: string;
  first_name: string;
  last_name: string;
  profile_role: string;
}

export interface Account {
  account_id: string;
  email: string | undefined;
  subscription_status: string;
  pharmacy_name: string | null;
}

export interface Bookmark {
  resource_id: string; // We only need the ID for the "queue"
}

export interface TrainingProgress {
  training_module_id: string;
  last_position: string;
  is_completed: boolean;
  updated_at: string;
}

// --- 2. SUPABASE CLIENT INITIALIZATION ---
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- HELPER FUNCTION ---
const fetchAccountDetails = async (accountId: string): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('account_id, email, subscription_status, pharmacy_name')
    .eq('account_id', accountId)
    .single();

  if (error) {
    console.error('Error fetching account details:', error.message);
    return null;
  }
  return data as Account;
};


// --- 3. STATE MANAGEMENT STORE (ZUSTAND) ---
interface AppState {
  // ACCOUNT STATE
  session: Session | null;
  account: Account | null;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';

  // PROFILE STATE
  profiles: Profile[];
  activeProfile: Profile | null;
  profileStatus: 'loading' | 'loaded' | 'error';

  // PERSONALIZATION STATE ("The Netflix Queue")
  bookmarks: string[]; // Store as an array of resource_ids
  bookmarksStatus: 'loading' | 'loaded' | 'error';
  trainingProgress: TrainingProgress[];
  progressStatus: 'loading' | 'loaded' | 'error';

  // ACTIONS
  auth: {
    signInWithPassword: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
    listenToAuthChanges: () => () => void;
  };
  profile: {
    fetchProfiles: () => Promise<void>;
    setActiveProfile: (profile: Profile) => void;
    createNewProfile: (firstName: string, lastName: string, role: string) => Promise<void>;
    clearProfileState: () => void;
  };
  personalization: {
    fetchBookmarks: (profileId: string) => Promise<void>;
    addBookmark: (resourceId: string) => Promise<void>;
    removeBookmark: (resourceId: string) => Promise<void>;
    fetchTrainingProgress: (profileId: string) => Promise<void>;
    upsertTrainingProgress: (progress: Omit<TrainingProgress, 'updated_at'>) => Promise<void>;
    clearPersonalizationState: () => void;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  // --- INITIAL STATE ---
  session: null,
  account: null,
  authStatus: 'loading',
  profiles: [],
  activeProfile: null,
  profileStatus: 'loading',
  bookmarks: [],
  bookmarksStatus: 'loading',
  trainingProgress: [],
  progressStatus: 'loading',

  // --- ACTIONS ---

  auth: {
    signInWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    listenToAuthChanges: () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const accountDetails = await fetchAccountDetails(session.user.id);
            if (accountDetails) {
              set({ session, account: accountDetails, authStatus: 'authenticated' });
              await get().profile.fetchProfiles();
            } else {
              console.error("Critical: Could not fetch account details for user:", session.user.id);
              await get().auth.signOut();
            }
          } else if (event === 'SIGNED_OUT') {
            set({ session: null, account: null, authStatus: 'unauthenticated' });
            get().profile.clearProfileState();
            get().personalization.clearPersonalizationState();
          }
        }
      );
      return () => subscription.unsubscribe();
    },
  },

  profile: {
    fetchProfiles: async () => {
      set({ profileStatus: 'loading' });
      const { data, error } = await supabase.rpc('get_profiles_for_account');
      if (error) set({ profileStatus: 'error', profiles: [] });
      else if (data) set({ profiles: data as Profile[], profileStatus: 'loaded' });
    },
    /**
     * CRITICAL UPDATE: Setting the active profile now triggers fetching
     * of all personalization data for that profile.
     */
    setActiveProfile: (profile) => {
      set({ activeProfile: profile });
      get().personalization.fetchBookmarks(profile.profile_id);
      get().personalization.fetchTrainingProgress(profile.profile_id);
    },
    createNewProfile: async (firstName, lastName, role) => {
      const { data, error } = await supabase.rpc('create_new_profile', {
        first_name_param: firstName,
        last_name_param: lastName,
        profile_role_param: role,
      });
      if (error) throw error;
      else if (data) set(state => ({ profiles: [...state.profiles, data[0] as Profile] }));
    },
    clearProfileState: () => {
      set({ profiles: [], activeProfile: null, profileStatus: 'loading' });
    }
  },

  // C. PERSONALIZATION ACTIONS
  personalization: {
    fetchBookmarks: async (profileId) => {
      set({ bookmarksStatus: 'loading' });
      const { data, error } = await supabase.rpc('get_profile_bookmarks', { profile_id_param: profileId });
      if (error) set({ bookmarksStatus: 'error', bookmarks: [] });
      else if (data) set({ bookmarks: (data as Bookmark[]).map(b => b.resource_id), bookmarksStatus: 'loaded' });
    },
    addBookmark: async (resourceId) => {
      const profileId = get().activeProfile?.profile_id;
      if (!profileId) return;
      // Optimistic update for instant UI feedback
      set(state => ({ bookmarks: [...state.bookmarks, resourceId] }));
      const { error } = await supabase.rpc('add_bookmark', { profile_id_param: profileId, resource_id_param: resourceId });
      if (error) { // Rollback on error
        set(state => ({ bookmarks: state.bookmarks.filter(id => id !== resourceId) }));
        console.error("Failed to add bookmark:", error);
      }
    },
    removeBookmark: async (resourceId) => {
      const profileId = get().activeProfile?.profile_id;
      if (!profileId) return;
      // Optimistic update
      const originalBookmarks = get().bookmarks;
      set(state => ({ bookmarks: state.bookmarks.filter(id => id !== resourceId) }));
      const { error } = await supabase.rpc('remove_bookmark', { profile_id_param: profileId, resource_id_param: resourceId });
      if (error) { // Rollback on error
        set({ bookmarks: originalBookmarks });
        console.error("Failed to remove bookmark:", error);
      }
    },
    fetchTrainingProgress: async (profileId) => {
      set({ progressStatus: 'loading' });
      const { data, error } = await supabase.rpc('get_profile_training_progress', { profile_id_param: profileId });
      if (error) set({ progressStatus: 'error', trainingProgress: [] });
      else if (data) set({ trainingProgress: data as TrainingProgress[], progressStatus: 'loaded' });
    },
    upsertTrainingProgress: async (progress) => {
        const profileId = get().activeProfile?.profile_id;
        if (!profileId) return;
        const { error } = await supabase.rpc('upsert_training_progress', {
            profile_id_param: profileId,
            module_id_param: progress.training_module_id,
            last_position_param: progress.last_position,
            is_completed_param: progress.is_completed,
        });
        if (error) console.error("Failed to update progress:", error);
    },
    clearPersonalizationState: () => {
      set({ bookmarks: [], bookmarksStatus: 'loading', trainingProgress: [], progressStatus: 'loading' });
    }
  },
}));

