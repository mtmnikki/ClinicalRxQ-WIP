/**
 * Type definitions for ClinicalRxQ application
 */

// Account type matches public.accounts table in Supabase
export interface Account {
  id: string;
  email: string;
  pharmacy_name: string;
  subscription_status: 'active' | 'inactive' | 'cancelled';
  created_at: string;
  updated_at: string;
  pharmacy_phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: Module[];
  resources: Resource[];
  thumbnail: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  duration: string;
  order: number;
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  url: string;
  description: string;
  category: string;
}

// Profile system types
export type ProfileRole = 'Pharmacist' | 'Pharmacist-PIC' | 'Pharmacy Technician' | 'Intern' | 'Admin' | 'Pharmacy' | null;

export interface PharmacyProfile {
  id: string;
  member_account_id: string;
  
  // Required fields
  role: ProfileRole;
  firstName: string;
  lastName: string;
  
  // Optional fields
  phone?: string;
  email?: string;
  licenseNumber?: string;
  nabpEProfileId?: string;
  
  // System fields
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  role: ProfileRole;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  nabpEProfileId?: string;
}

export interface ProfileFormData extends CreateProfileData {
  // Same as CreateProfileData for forms
}
