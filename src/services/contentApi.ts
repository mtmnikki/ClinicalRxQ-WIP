/**
 * Content API Service - Production implementation using official Supabase client
 * Leverages storage_files_catalog table with proper joins and filters
 * Uses official @supabase/supabase-js client with full TypeScript support
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';

// Create typed Supabase client
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (!supabaseUrl) {
  throw new Error('Supabase URL is not configured. Set VITE_SUPABASE_URL or localStorage SUPABASE_URL.');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper types from database
type StorageFilesRow = Database['public']['Tables']['storage_files_catalog']['Row'];
type ProgramsRow = Database['public']['Tables']['programs']['Row'];
type TrainingModulesRow = Database['public']['Tables']['training_modules']['Row'];

// Legacy compatibility types for existing UI components
export interface StorageFileItem {
  path: string;
  url: string;
  filename: string;
  title: string;
  mimeType?: string;
  size?: number;
}

export interface ProgramListItem {
  slug: string;
  name: string;
  description?: string | null;
}

// Program slugs from database enum
export const ProgramSlugs = [
  'mtmthefuturetoday',
  'timemymeds', 
  'testandtreat',
  'hba1c',
  'oralcontraceptives',
] as const;

export type ProgramSlug = typeof ProgramSlugs[number];

/**
 * Convert database file row to legacy StorageFileItem format for UI compatibility
 */
function mapFileToStorageItem(file: StorageFilesRow, displayName?: string): StorageFileItem {
  // Strip file extension for title (legacy behavior)
  const title = displayName ? displayName.replace(/\.[^/.]+$/, '') : file.file_name.replace(/\.[^/.]+$/, '');
  
  return {
    path: file.id, // Use file ID as path for uniqueness
    url: file.file_url,
    filename: file.file_name,
    title: title,
    mimeType: file.mime_type || undefined,
    size: file.file_size || undefined
  };
}

/**
 * Content API - Main service interface using official Supabase client
 */
export const contentApi = {
  /**
   * Get all programs with basic info
   */
  async listPrograms(): Promise<ProgramListItem[]> {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('slug, name, description')
        .order('name');

      if (error) throw error;

      return data.map(program => ({
        slug: program.slug as ProgramSlug,
        name: program.name,
        description: program.description
      }));
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      throw error;
    }
  },

  /**
   * Get program resources grouped by use_case (tab content)
   * Uses storage_files_catalog with program_name filter and use_case grouping
   */
  async getProgramResourcesGrouped(programSlug: string): Promise<{
    forms: StorageFileItem[];
    protocols: StorageFileItem[];
    resources: StorageFileItem[];
    training: StorageFileItem[];
  }> {
    try {
      // Get program info first to get the program_name for filtering
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('name')
        .eq('slug', programSlug)
        .single();

      if (programError) throw programError;

      // Get all files for this program from storage_files_catalog
      const { data: files, error: filesError } = await supabase
        .from('storage_files_catalog')
        .select('*')
        .eq('program_name', programData.name)
        .order('file_name');

      if (filesError) throw filesError;

      // Group files by use_case
      const grouped = {
        forms: [] as StorageFileItem[],
        protocols: [] as StorageFileItem[],
        resources: [] as StorageFileItem[],
        training: [] as StorageFileItem[]
      };

      files.forEach(file => {
        const item = mapFileToStorageItem(file);
        
        // Map use_case to tab categories
        switch (file.use_case?.toLowerCase()) {
          case 'forms':
          case 'documentation':
            grouped.forms.push(item);
            break;
          case 'protocols':
          case 'protocol':
            grouped.protocols.push(item);
            break;
          case 'training':
          case 'training modules':
            grouped.training.push(item);
            break;
          case 'resources':
          case 'additional resources':
          default:
            grouped.resources.push(item);
            break;
        }
      });

      return grouped;
    } catch (error) {
      console.error(`Failed to get grouped resources for ${programSlug}:`, error);
      throw error;
    }
  },

  /**
   * Get training modules with progress info (joins with training_modules table)
   */
  async getTrainingModulesWithProgress(programSlug: string, profileId?: string): Promise<StorageFileItem[]> {
    try {
      // Get program ID first
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('id')
        .eq('slug', programSlug)
        .single();

      if (programError) throw programError;

      // Join training_modules with storage_files_catalog to get file info and sort order
      const query = supabase
        .from('training_modules')
        .select(`
          id,
          name,
          length,
          sort_order,
          storage_files_catalog!inner (
            id,
            file_name,
            file_url,
            mime_type,
            file_size
          )
        `)
        .eq('program_id', programData.id)
        .order('sort_order');

      const { data: modules, error: modulesError } = await query;

      if (modulesError) throw modulesError;

      return modules.map(module => 
        mapFileToStorageItem(module.storage_files_catalog as StorageFilesRow, module.name || undefined)
      );
    } catch (error) {
      console.error(`Failed to get training modules for ${programSlug}:`, error);
      throw error;
    }
  },

  /**
   * Get global category resources (patient handouts, clinical guidelines, medical billing)
   */
  async getGlobalCategory(category: 'handouts' | 'guidelines' | 'billing'): Promise<StorageFileItem[]> {
    try {
      switch (category) {
        case 'handouts': {
          const { data, error } = await supabase
            .from('patient_handouts')
            .select(`
              name,
              storage_files_catalog!inner (
                id,
                file_name,
                file_url,
                mime_type,
                file_size
              )
            `)
            .order('name');

          if (error) throw error;

          return data.map(item => 
            mapFileToStorageItem(item.storage_files_catalog, item.name)
          );
        }

        case 'guidelines': {
          const { data, error } = await supabase
            .from('clinical_guidelines')
            .select(`
              name,
              storage_files_catalog!inner (
                id,
                file_name,
                file_url,
                mime_type,
                file_size
              )
            `)
            .order('name');

          if (error) throw error;

          return data.map(item => 
            mapFileToStorageItem(item.storage_files_catalog, item.name)
          );
        }

        case 'billing': {
          const { data, error } = await supabase
            .from('medical_billing_resources')
            .select(`
              name,
              storage_files_catalog!inner (
                id,
                file_name,
                file_url,
                mime_type,
                file_size
              )
            `)
            .order('name');

          if (error) throw error;

          return data.map(item => 
            mapFileToStorageItem(item.storage_files_catalog, item.name)
          );
        }

        default:
          return [];
      }
    } catch (error) {
      console.error(`Failed to get global category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Search files across all content with filters
   */
  async searchFiles(options: {
    searchTerm?: string;
    programName?: string;
    useCase?: string;
    category?: string;
    mimeType?: string;
  } = {}): Promise<StorageFileItem[]> {
    try {
      let query = supabase
        .from('storage_files_catalog')
        .select('*');

      // Apply filters
      if (options.programName) {
        query = query.eq('program_name', options.programName);
      }
      
      if (options.useCase) {
        query = query.eq('use_case', options.useCase);
      }
      
      if (options.category) {
        query = query.eq('form_category', options.category);
      }
      
      if (options.mimeType) {
        query = query.like('mime_type', `${options.mimeType}%`);
      }
      
      if (options.searchTerm) {
        query = query.or(`file_name.ilike.%${options.searchTerm}%,program_name.ilike.%${options.searchTerm}%`);
      }

      query = query.order('file_name');

      const { data, error } = await query;

      if (error) throw error;

      return data.map(file => mapFileToStorageItem(file));
    } catch (error) {
      console.error('Failed to search files:', error);
      throw error;
    }
  },

  /**
   * Get announcements for dashboard
   */
  async getAnnouncements(limit: number = 5): Promise<Array<{
    id: number;
    title: string | null;
    body: string | null;
    created_at: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, body, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Failed to get announcements:', error);
      throw error;
    }
  },

  /**
   * Legacy compatibility: List programs for storage catalog
   */
  async listProgramsFromStorage(): Promise<ProgramListItem[]> {
    return this.listPrograms();
  }
};

/**
 * Legacy exports for backward compatibility
 */
export const getProgramResourcesGrouped = contentApi.getProgramResourcesGrouped.bind(contentApi);
export const listProgramsFromStorage = contentApi.listProgramsFromStorage.bind(contentApi);
export const getGlobalCategory = contentApi.getGlobalCategory.bind(contentApi);

export default contentApi;
