/**
 * Clean Supabase Client Service
 * Implements the exact data architecture specified in CLAUDE.md
 */

import { getSupabaseAnonKey, getSupabaseUrl } from '../config/supabaseConfig';

// ============================================
// Type Definitions (matching database schema)
// ============================================

export interface Program {
  name: string;
  description: string;
  experience_level: string;
}

export interface TrainingResource {
  file_name: string;
  file_url: string;
  length: string;
  sort_order: number;
}

export interface ProgramResource {
  file_name: string;
  file_url: string;
  resource_type: 'protocol_manual' | 'documentation_form' | 'additional_resource';
  form_category?: string;
  form_subcategory?: string;
}

export interface StorageFile {
  file_name: string;
  file_url: string;
  program_name: string;
  resource_type: string;
}

// ============================================
// Internal REST Helper
// ============================================

async function supabaseREST<T>(endpoint: string): Promise<T> {
  const base = getSupabaseUrl();
  const anon = getSupabaseAnonKey();

  if (!base) {
    throw new Error('Supabase URL is not configured');
  }

  const url = `${base}/rest/v1${endpoint}`;
  const headers = {
    Authorization: `Bearer ${anon}`,
    apikey: anon,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${res.status}): ${text || res.statusText}`);
  }

  if (res.status === 204) {
    return [] as unknown as T;
  }

  return res.json();
}

// ============================================
// Programs Service
// ============================================

export const programsService = {
  /**
   * Fetch all programs from the programs table
   * Query: SELECT name, description, experience_level FROM programs ORDER BY name ASC
   */
  async getAllPrograms(): Promise<Program[]> {
    return supabaseREST<Program[]>('/programs?select=name,description,experience_level&order=name.asc');
  },
};

// ============================================
// Training Resources Service
// ============================================

export const trainingService = {
  /**
   * Fetch training modules for a specific program
   * Query: SELECT file_name, file_url, length FROM training_resources_view 
   *        WHERE program_name = :program ORDER BY sort_order ASC
   */
  async getTrainingModules(programName: string): Promise<TrainingResource[]> {
    const encoded = encodeURIComponent(programName);
    return supabaseREST<TrainingResource[]>(
      `/training_resources_view?select=file_name,file_url,length,sort_order&program_name=eq.${encoded}&order=sort_order.asc`
    );
  },
};

// ============================================
// Program Resources Service (Views)
// ============================================

// Map program names to their view names
const PROGRAM_VIEW_MAP: Record<string, string> = {
  'HbA1C Testing (A1C)': 'hba1c_view',
  'TimeMyMeds': 'timemymeds_view',
  'Oral Contraceptives': 'oralcontraceptives_view',
  'MTM The Future Today': 'mtmthefuturetoday_view',
  'Test and Treat': 'testandtreat_view',
};

export const programResourcesService = {
  /**
   * Fetch resources from a program-specific view
   * @param programName The program name (e.g., "HbA1C Testing (A1C)")
   * @param resourceType The type of resource to fetch
   */
  async getProgramResources(
    programName: string,
    resourceType: 'protocol_manual' | 'documentation_form' | 'additional_resource'
  ): Promise<ProgramResource[]> {
    const viewName = PROGRAM_VIEW_MAP[programName];
    if (!viewName) {
      throw new Error(`No view configured for program: ${programName}`);
    }

    const encodedType = encodeURIComponent(resourceType);
    
    // For forms in MTM/Test&Treat, include category fields
    const needsCategories = 
      resourceType === 'documentation_form' && 
      (programName === 'MTM The Future Today' || programName === 'Test and Treat');
    
    const selectFields = needsCategories
      ? 'file_name,file_url,resource_type,form_category,form_subcategory'
      : 'file_name,file_url,resource_type';
    
    const orderBy = needsCategories 
      ? '' // No ordering - will be handled client-side for nested accordions
      : '&order=file_name.asc';

    return supabaseREST<ProgramResource[]>(
      `/${viewName}?select=${selectFields}&resource_type=eq.${encodedType}${orderBy}`
    );
  },

  /**
   * Get all resources for a program (all types)
   */
  async getAllProgramResources(programName: string): Promise<{
    manuals: ProgramResource[];
    forms: ProgramResource[];
    additionalResources: ProgramResource[];
  }> {
    const [manuals, forms, additionalResources] = await Promise.all([
      this.getProgramResources(programName, 'protocol_manual'),
      this.getProgramResources(programName, 'documentation_form'),
      this.getProgramResources(programName, 'additional_resource'),
    ]);

    return { manuals, forms, additionalResources };
  },
};

// ============================================
// Resource Library Service
// ============================================

export const resourceLibraryService = {
  /**
   * Fetch all resources from storage_files_catalog for client-side filtering
   * Query: SELECT file_name, file_url, program_name, resource_type FROM storage_files_catalog
   */
  async getAllResources(): Promise<StorageFile[]> {
    return supabaseREST<StorageFile[]>(
      '/storage_files_catalog?select=file_name,file_url,program_name,resource_type'
    );
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Group forms by category and subcategory for nested accordions
 */
export function groupFormsByCategory(forms: ProgramResource[]) {
  const grouped: Record<string, Record<string, ProgramResource[]>> = {};

  forms.forEach(form => {
    const category = form.form_category || 'Uncategorized';
    const subcategory = form.form_subcategory || 'General';

    if (!grouped[category]) {
      grouped[category] = {};
    }
    if (!grouped[category][subcategory]) {
      grouped[category][subcategory] = [];
    }

    grouped[category][subcategory].push(form);
  });

  // Sort everything alphabetically
  const sortedResult: Record<string, Record<string, ProgramResource[]>> = {};
  const sortedCategories = Object.keys(grouped).sort();

  sortedCategories.forEach(category => {
    sortedResult[category] = {};
    const sortedSubcategories = Object.keys(grouped[category]).sort();
    
    sortedSubcategories.forEach(subcategory => {
      sortedResult[category][subcategory] = grouped[category][subcategory]
        .sort((a, b) => a.file_name.localeCompare(b.file_name));
    });
  });

  return sortedResult;
}