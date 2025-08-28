export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          address1: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          pharmacy_name: string | null
          pharmacy_phone: string | null
          state: string | null
          subscription_status: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          address1?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          state?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Update: {
          address1?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          state?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      additional_resources: {
        Row: {
          created_at: string | null
          id: string
          name: string
          program_id: string | null
          storage_file_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          program_id?: string | null
          storage_file_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          program_id?: string | null
          storage_file_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "additional_resources_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "additional_resources_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "additional_resources_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "additional_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "additional_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "additional_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
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
          resource_type: Database["public"]["Enums"]["specific_resource_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id: string
          resource_type: Database["public"]["Enums"]["specific_resource_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          resource_id?: string
          resource_type?: Database["public"]["Enums"]["specific_resource_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      clinical_guidelines: {
        Row: {
          created_at: string | null
          id: string
          name: string
          storage_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_guidelines_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "clinical_guidelines_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_guidelines_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      documentation_forms: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          program_id: string | null
          storage_file_id: string | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          program_id?: string | null
          storage_file_id?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          program_id?: string | null
          storage_file_id?: string | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentation_forms_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "documentation_forms_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentation_forms_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "documentation_forms_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "documentation_forms_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentation_forms_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      kv_store_8a7dc670: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      medical_billing_resources: {
        Row: {
          created_at: string | null
          id: string
          name: string
          storage_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_billing_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "medical_billing_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_billing_resources_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          license_number: string | null
          member_account_id: string | null
          nabp_eprofile_id: string | null
          phone_number: string | null
          profile_email: string | null
          role: Database["public"]["Enums"]["profile_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_number?: string | null
          member_account_id?: string | null
          nabp_eprofile_id?: string | null
          phone_number?: string | null
          profile_email?: string | null
          role?: Database["public"]["Enums"]["profile_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          license_number?: string | null
          member_account_id?: string | null
          nabp_eprofile_id?: string | null
          phone_number?: string | null
          profile_email?: string | null
          role?: Database["public"]["Enums"]["profile_role"] | null
          updated_at?: string | null
        }
        Relationships: []
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
          member_profile_id: string
          notes: string | null
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
          member_profile_id: string
          notes?: string | null
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
          member_profile_id?: string
          notes?: string | null
          score?: number | null
          started_at?: string | null
          training_module_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_training_progress_member_profile_id_fkey"
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_training_progress_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_training_progress_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["training_module_id"]
          },
        ]
      }
      patient_handouts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          storage_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_handouts_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "patient_handouts_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_handouts_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
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
      protocol_manuals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          program_id: string | null
          storage_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          program_id?: string | null
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          program_id?: string | null
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_manuals_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "protocol_manuals_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_manuals_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "protocol_manuals_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "protocol_manuals_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_manuals_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
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
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_activity_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "recent_activity_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_activity_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      storage_files_catalog: {
        Row: {
          bucket_name: string
          content_class: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_url: string
          form_category: string | null
          form_subcategory: string | null
          id: string
          last_modified: string | null
          medical_conditions: string | null
          mime_type: string | null
          program_id: string | null
          program_name: string | null
          updated_at: string | null
          use_case: string | null
        }
        Insert: {
          bucket_name: string
          content_class?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_url: string
          form_category?: string | null
          form_subcategory?: string | null
          id?: string
          last_modified?: string | null
          medical_conditions?: string | null
          mime_type?: string | null
          program_id?: string | null
          program_name?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Update: {
          bucket_name?: string
          content_class?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_url?: string
          form_category?: string | null
          form_subcategory?: string | null
          id?: string
          last_modified?: string | null
          medical_conditions?: string | null
          mime_type?: string | null
          program_id?: string | null
          program_name?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_files_catalog_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "storage_files_catalog_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_files_catalog_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["program_id"]
          },
        ]
      }
      training_modules: {
        Row: {
          created_at: string | null
          id: string
          length: string | null
          name: string | null
          program_id: string | null
          sort_order: number | null
          storage_file_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          length?: string | null
          name?: string | null
          program_id?: string | null
          sort_order?: number | null
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          length?: string | null
          name?: string | null
          program_id?: string | null
          sort_order?: number | null
          storage_file_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "training_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "training_modules_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "documentation_forms_view"
            referencedColumns: ["file_id"]
          },
          {
            foreignKeyName: "training_modules_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "storage_files_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_storage_file_id_fkey"
            columns: ["storage_file_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["file_id"]
          },
        ]
      }
      us_gaz: {
        Row: {
          id: number
          is_custom: boolean
          seq: number | null
          stdword: string | null
          token: number | null
          word: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Relationships: []
      }
      us_lex: {
        Row: {
          id: number
          is_custom: boolean
          seq: number | null
          stdword: string | null
          token: number | null
          word: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Relationships: []
      }
      us_rules: {
        Row: {
          id: number
          is_custom: boolean
          rule: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          rule?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          rule?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      documentation_forms_view: {
        Row: {
          category: string | null
          file_id: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          form_id: string | null
          form_name: string | null
          mime_type: string | null
          program_id: string | null
          program_name: string | null
          subcategory: string | null
        }
        Relationships: []
      }
      member_training_status: {
        Row: {
          attempts: number | null
          completed_at: string | null
          completion_percentage: number | null
          first_name: string | null
          id: string | null
          is_completed: boolean | null
          last_name: string | null
          member_profile_id: string | null
          module_length: string | null
          module_name: string | null
          program_name: string | null
          score: number | null
          started_at: string | null
          training_module_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_training_progress_member_profile_id_fkey"
            columns: ["member_profile_id"]
            isOneToOne: false
            referencedRelation: "member_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_training_progress_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_training_progress_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_resources_view"
            referencedColumns: ["training_module_id"]
          },
        ]
      }
      training_resources_view: {
        Row: {
          content_class: string | null
          experience_level: string | null
          file_id: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          length: string | null
          mime_type: string | null
          program_id: string | null
          program_name: string | null
          sort_order: number | null
          training_module_id: string | null
          training_module_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      categorize_file: {
        Args: { file_path: string }
        Returns: {
          category: string
          program_name: string
          subcategory: string
        }[]
      }
      get_file_statistics: {
        Args: { p_days_back?: number; p_file_id: string }
        Returns: {
          avg_view_duration: number
          file_id: string
          file_name: string
          most_recent_access: string
          total_views: number
          unique_viewers: number
        }[]
      }
      get_related_files: {
        Args: { file_id: string; limit_count?: number }
        Returns: {
          content_class: string
          file_name: string
          file_path: string
          file_url: string
          id: string
          program_name: string
          relation_type: string
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_all_files: {
        Args: { bucket_name: string }
        Returns: {
          id: string
          metadata: Json
          name: string
          path: string
        }[]
      }
      parse_file_path_to_columns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      populate_storage_files_catalog: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_content: {
        Args: { search_term: string }
        Returns: {
          category: string
          file_name: string
          file_path: string
          file_url: string
          id: string
          media_type: string
          program_name: string
          relevance_score: number
          subcategory: string
        }[]
      }
      search_files: {
        Args: {
          category?: string
          content_class?: string
          mime_type?: string
          program_id?: string
          search_term?: string
          subcategory?: string
        }
        Returns: {
          category: string
          content_class: string
          file_name: string
          file_path: string
          file_size: number
          file_url: string
          id: string
          last_modified: string
          mime_type: string
          program_id: string
          program_name: string
          subcategory: string
        }[]
      }
      split_filename: {
        Args: { full_filename: string }
        Returns: {
          base_name: string
          file_type: string
        }[]
      }
      strip_file_extension: {
        Args: { filename: string }
        Returns: string
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      track_file_access: {
        Args: { p_file_id: string; p_profile_id: string }
        Returns: undefined
      }
      update_category_from_path_parts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_form_category_from_use_case: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_form_subcategory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_medical_conditions_from_subcategory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_resource_file_reference: {
        Args: { file_id: string; res_id: string; table_name: string }
        Returns: boolean
      }
      update_subcategory_from_path_parts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      medical_conditions:
        | "Beers List"
        | "Cardiovascular"
        | "Chronic Pain"
        | "Endocrine"
        | "ENT"
        | "Gastrointestinal"
        | "Genitourinary"
        | "Hematological"
        | "Infectious Disease"
        | "Musculoskeletal"
        | "Neurological"
        | "Psychiatric"
        | "Reproductive"
        | "Respiratory"
        | "Other"
      profile_role:
        | "Pharmacist"
        | "Pharmacist-PIC"
        | "Pharmacy Technician"
        | "Intern"
        | "Admin"
        | "Pharmacy"
      specific_resource_type:
        | "documentation_form"
        | "protocol_manual"
        | "training_module"
        | "additional_resource"
        | "patient_handout"
        | "clinical_guideline"
        | "medical_billing"
        | "other"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      medical_conditions: [
        "Beers List",
        "Cardiovascular",
        "Chronic Pain",
        "Endocrine",
        "ENT",
        "Gastrointestinal",
        "Genitourinary",
        "Hematological",
        "Infectious Disease",
        "Musculoskeletal",
        "Neurological",
        "Psychiatric",
        "Reproductive",
        "Respiratory",
        "Other",
      ],
      profile_role: [
        "Pharmacist",
        "Pharmacist-PIC",
        "Pharmacy Technician",
        "Intern",
        "Admin",
        "Pharmacy",
      ],
      specific_resource_type: [
        "documentation_form",
        "protocol_manual",
        "training_module",
        "additional_resource",
        "patient_handout",
        "clinical_guideline",
        "medical_billing",
        "other",
      ],
    },
  },
} as const
