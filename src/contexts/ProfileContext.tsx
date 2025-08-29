// contexts/ProfileContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, Profile } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  activeProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
  createProfile: (profileData: Partial<Profile>) => Promise<{ profile: Profile | null; error: any }>;
  updateProfile: (profileId: string, profileData: Partial<Profile>) => Promise<{ error: any }>;
  selectProfile: (profileId: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, account } = useAuth();
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profiles when user or account changes
  useEffect(() => {
    if (account?.account_id) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setActiveProfile(null);
      setIsLoading(false);
    }
  }, [account?.account_id]);

  // Check for active profile in localStorage on initial load
  useEffect(() => {
    const storedProfileId = localStorage.getItem('activeProfileId');
    if (storedProfileId && profiles.length > 0) {
      const storedProfile = profiles.find(p => p.profile_id === storedProfileId);
      if (storedProfile) {
        setActiveProfile(storedProfile);
      } else if (profiles.length > 0) {
        // If stored profile not found but there are profiles, select the first one
        setActiveProfile(profiles[0]);
        localStorage.setItem('activeProfileId', profiles[0].profile_id);
      }
    } else if (profiles.length > 0) {
      // If no stored profile and profiles exist, select the first one
      setActiveProfile(profiles[0]);
      localStorage.setItem('activeProfileId', profiles[0].profile_id);
    }
  }, [profiles]);

  const fetchProfiles = async () => {
    if (!account?.account_id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('account_id', account.account_id);

      if (error) {
        throw error;
      }

      setProfiles(data as Profile[]);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async (profileData: Partial<Profile>) => {
    if (!account?.account_id) {
      return { profile: null, error: 'No account found' };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Make sure account_id is set
      const newProfileData = {
        ...profileData,
        account_id: account.account_id
      };

      const { data, error } = await supabase
        .from('member_profiles')
        .insert([newProfileData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the new profile to the list and set as active
      const newProfile = data as Profile;
      setProfiles(prev => [...prev, newProfile]);
      setActiveProfile(newProfile);
      localStorage.setItem('activeProfileId', newProfile.profile_id);

      return { profile: newProfile, error: null };
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile');
      return { profile: null, error: err.message || 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileId: string, profileData: Partial<Profile>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('member_profiles')
        .update(profileData)
        .eq('profile_id', profileId);

      if (error) {
        throw error;
      }

      // Update the local state
      setProfiles(prev => 
        prev.map(p => p.profile_id === profileId ? { ...p, ...profileData } : p)
      );
      
      if (activeProfile?.profile_id === profileId) {
        setActiveProfile(prev => prev ? { ...prev, ...profileData } : null);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      return { error: err.message || 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  const selectProfile = async (profileId: string) => {
    const selectedProfile = profiles.find(p => p.profile_id === profileId);
    if (selectedProfile) {
      setActiveProfile(selectedProfile);
      localStorage.setItem('activeProfileId', profileId);
    }
  };

  const value = {
    activeProfile,
    profiles,
    isLoading,
    error,
    createProfile,
    updateProfile,
    selectProfile,
    fetchProfiles
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};