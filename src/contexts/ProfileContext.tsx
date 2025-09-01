import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { MemberProfile, CreateMemberProfileData } from '../types';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  activeProfile: MemberProfile | null;
  profiles: MemberProfile[];
  isLoading: boolean;
  error: string | null;
  selectProfile: (profileId: string) => void;
  createProfile: (profileData: CreateMemberProfileData) => Promise<{ data: MemberProfile | null; error: string | null }>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, isLoading: isAuthLoading } = useAuth();
  const [activeProfile, setActiveProfile] = useState<MemberProfile | null>(null);
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't do anything until the auth state is resolved
    if (isAuthLoading) return;

    const fetchProfiles = async () => {
      if (!account?.account_id) {
        // If there's no account, clear all profile data
        setProfiles([]);
        setActiveProfile(null);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('account_id', account.account_id);

      if (fetchError) {
        setError('Failed to load profiles');
        console.error('Error fetching profiles:', fetchError);
      } else {
        const fetchedProfiles = (data as MemberProfile[]) || [];
        
        // If no profiles exist, auto-create pharmacy profile
        if (fetchedProfiles.length === 0) {
          const pharmacyProfile = await ensurePharmacyProfile(account.account_id);
          if (pharmacyProfile) {
            return; // ensurePharmacyProfile will call selectProfile, so exit early
          }
        }
        
        setProfiles(fetchedProfiles);

        // Check for a stored active profile for this specific account
        const storedProfileId = localStorage.getItem(`activeProfileId_${account.account_id}`);
        const foundProfile = fetchedProfiles.find(p => p.profile_id === storedProfileId);
        
        if (foundProfile) {
          setActiveProfile(foundProfile);
        } else if (fetchedProfiles.length > 0) {
          // Auto-select first profile (likely the pharmacy profile)
          selectProfile(fetchedProfiles[0].profile_id);
        }
      }
      setIsLoading(false);
    };

    fetchProfiles();
  }, [account, isAuthLoading]);

  const selectProfile = (profileId: string) => {
    const selected = profiles.find(p => p.profile_id === profileId);
    if (selected && account) {
      setActiveProfile(selected);
      // Namespace the localStorage key by account to support multiple accounts
      localStorage.setItem(`activeProfileId_${account.account_id}`, profileId);
    }
  };

  const createProfile = async (profileData: CreateMemberProfileData) => {
    if (!account?.account_id) return { data: null, error: 'No authenticated account.' };
    
    const { data, error: insertError } = await supabase
      .from('member_profiles')
      .insert([{ ...profileData, account_id: account.account_id }])
      .select()
      .single();

    if (insertError) {
      setError('Failed to create profile.');
      return { data: null, error: insertError.message };
    }

    const newProfile = data as MemberProfile;
    setProfiles(prev => [...prev, newProfile]);
    selectProfile(newProfile.profile_id); // Automatically select the new profile
    return { data: newProfile, error: null };
  };

  // Auto-create pharmacy profile if account has no profiles
  const ensurePharmacyProfile = async (accountId: string) => {
    if (!account?.pharmacy_name) return;
    
    const pharmacyProfileData = {
      first_name: 'Pharmacy',
      last_name: 'Admin',
      profile_role: 'Pharmacy' as const,
      profile_email: account.email,
      phone_number: account.pharmacy_phone,
    };

    const result = await createProfile(pharmacyProfileData);
    return result.data;
  };

  const value = {
    activeProfile,
    profiles,
    isLoading,
    error,
    selectProfile,
    createProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

