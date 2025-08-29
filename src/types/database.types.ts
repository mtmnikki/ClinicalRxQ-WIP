/**
 * This file contains the exact TypeScript types generated from your Supabase schema.
 * It is the single source of truth for all database shapes.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_id: string
          address1: string | null
          city: string | null
          created_at: string | null
          email: string
          pharmacy_name: string | null
          pharmacy_phone: string | null
          state: string | null
          subscription_status: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          account_id: string
          address1?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          state?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          account_id?: string
          address1?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          state?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          body: string | null
          created_at: string
          id: number
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: number
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: number
          title?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          resource_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["profile_id"]
          }
        ]
      }
      member_profiles: {
        Row: {
          account_id: string | null
          created_at: string | null
          first_name: string | null
          last_name: string | null
          license_number: string | null
          nabp_eprofile_id: string | null
          phone_number: string | null
          profile_email: string | null
          profile_id: string
          profile_role: Database["public"]["Enums"]["profile_role"] | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          license_number?: string | null
          nabp_eprofile_id?: string | null
          phone_number?: string | null
          profile_email?: string | null
          profile_id?: string
          profile_role?: Database["public"]["Enums"]["profile_role"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          license_number?: string | null
          nabp_eprofile_id?: string | null
          phone_number?: string | null
          profile_email?: string | null
          profile_id?: string
          profile_role?: Database["public"]["Enums"]["profile_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          }
        ]
      }
      member_training_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          completion_percentage: number
          created_at: string | null
          id: string
          is_completed: boolean
          last_position: string | null
          notes: string | null
          profile_id: string
          score: number | null
          started_at: string | null
          training_module_id: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string | null
          id?: string
          is_completed?: boolean
          last_position?: string | null
          notes?: string | null
          profile_id: string
          score?: number | null
          started_at?: string | null
          training_module_id: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string | null
          id?: string
          is_completed?: boolean
          last_position?: string | null
          notes?: string | null
          profile_id?: string
          score?: number | null
          started_at?: string | null
          training_module_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_training_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["profile_id"]
          }
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          experience_level: string | null
          id: string
          name: string
          overview: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          name: string
          overview?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          experience_level?: string | null
          id?: string
          name?: string
          overview?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recent_activity: {
        Row: {
          accessed_at: string | null
          id: string
          profile_id: string | null
          resource_id: string | null
          resource_name: string
          resource_type: string
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id?: string | null
          resource_name: string
          resource_type: string
        }
        Update: {
          accessed_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id?: string | null
          resource_name?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_activity_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["profile_id"]
          }
        ]
      }
    }
    Enums: {
      profile_role:
        | "Pharmacist"
        | "Pharmacist-PIC"
        | "Pharmacy Technician"
        | "Intern"
        | "Admin"
        | "Pharmacy"
    }
  }
}
