import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Use Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Define types for member profiles and accounts
export type Profile = {
  profile_id: string;
  account_id: string | null;
  phone_number: string | null;
  profile_email: string | null;
  license_number: string | null;
  nabp_eprofile_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile_role: 'Pharmacist' | 'Pharmacist-PIC' | 'Pharmacy Technician' | 'Intern' | 'Admin' | 'Pharmacy' | null;
  first_name: string | null;
  last_name: string | null;
};

export type Account = {
  account_id: string;
  email: string;
  pharmacy_name: string | null;
  subscription_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  pharmacy_phone: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
};

// Type-safe service functions
export const programsService = {
  async getAll() {
    return supabase
      .from('programs')
      .select('*')
      .order('name');
  }
};

export const trainingService = {
  async getForProgram(programName: string) {
    return supabase
      .from('training_resources_view')
      .select('*')
      .eq('program_name', programName)
      .order('sort_order');
  }
};

export const resourceService = {
  async getForProgram(
    viewName: 'hba1c_view' | 'mtmthefututuretoday_view' | 'oralcontraceptives_view' | 'testandtreat_view' | 'timemymeds_view', 
    resourceType: Database['public']['Enums']['specific_resource_type']
  ) {
    return supabase
      .from(viewName)
      .select('*')
      .eq('resource_type', resourceType)
      .order('file_name');
  }
};

export const catalogService = {
  async getAll() {
    return supabase
      .from('storage_files_catalog')
      .select('*');
  }
};

export const dashboardService = {
  async getQuickAccess() {
    return { data: [], error: null }; // TODO: Implement when quick_access table exists
  },
  
  async getBookmarkedResources() {
    return supabase
      .from('bookmarks')
      .select('*');
  },
  
  async getRecentActivity(profileId: string) {
    return supabase
      .from('recent_activity')
      .select('*')
      .eq('profile_id', profileId)
      .order('accessed_at', { ascending: false })
      .limit(10);
  },
  
  async getAnnouncements() {
    return supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
  }
};

// Activity tracking service
export const activityService = {
  async trackFileAccess(fileId: string, profileId: string) {
    try {
      const { error } = await supabase.rpc('track_file_access', {
        p_file_id: fileId,
        p_profile_id: profileId
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error tracking file access:', err);
      // Don't throw error - activity tracking is not critical
    }
  }
};