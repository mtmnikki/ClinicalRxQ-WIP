/**
 * Dashboard API service using Supabase
 * Provides real data from Supabase for the Dashboard
 */

import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database.types';
import type { 
  Announcement, 
  ClinicalProgram, 
  QuickAccessItem, 
  RecentActivity, 
  ResourceItem 
} from '../types/dashboard';

type BookmarksRow = Database['public']['Tables']['bookmarks']['Row'];
type RecentActivityRow = Database['public']['Tables']['recent_activity']['Row'];
type AnnouncementsRow = Database['public']['Tables']['announcements']['Row'];

/**
 * Map program slugs to display names and icons
 */
const PROGRAM_METADATA: Record<string, { name: string; icon: string; description: string }> = {
  'mtm-future-today': {
    name: 'MTM The Future Today',
    icon: 'ClipboardCheck',
    description: 'Team-based Medication Therapy Management with proven protocols and technician workflows.'
  },
  'timemymeds': {
    name: 'TimeMyMeds',
    icon: 'CalendarCheck',
    description: 'Appointment-based care via synchronization workflows that unlock clinical service delivery.'
  },
  'test-treat': {
    name: 'Test & Treat Services',
    icon: 'Stethoscope',
    description: 'CLIA-waived testing and treatment plans for Flu, Strep, and COVID-19.'
  },
  'hba1c': {
    name: 'HbA1c Testing',
    icon: 'Activity',
    description: 'POC A1c testing integrated with diabetes care and MTM workflows.'
  },
  'oral-contraceptives': {
    name: 'Oral Contraceptives',
    icon: 'TestTubes',
    description: 'From patient intake to billing—simplified, step-by-step service workflows.'
  }
};

/**
 * Dashboard API methods
 */
export const Api = {
  /**
   * Get Clinical Programs from Supabase
   */
  async getPrograms(): Promise<ClinicalProgram[]> {
    try {
      const { data: programs, error } = await supabase
        .from('programs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (programs || []).map(program => {
        const metadata = PROGRAM_METADATA[program.slug] || {
          name: program.name,
          icon: 'FileText',
          description: program.description || ''
        };
        
        return {
          slug: program.slug,
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
          lastUpdatedISO: program.updated_at || program.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  },

  /**
   * Get Quick Access items based on popular resources
   */
  async getQuickAccess(): Promise<QuickAccessItem[]> {
    try {
      // For now, return a curated list of quick access items
      // In the future, this could be based on user behavior or admin configuration
      return [
        {
          id: 'qa-1',
          title: 'CMR Pharmacist Protocol',
          subtitle: 'MTM Protocols',
          cta: 'Download',
          icon: 'FileText',
          url: `${supabase.storage.from('clinicalrxqfiles').getPublicUrl('programs/mtm-future-today/protocols/pharmacist-protocol.pdf').data.publicUrl}`,
          external: true,
        },
        {
          id: 'qa-2',
          title: 'Training Videos',
          subtitle: 'Getting Started',
          cta: 'Watch',
          icon: 'PlayCircle',
          url: '/resources?category=training',
          external: false,
        },
        {
          id: 'qa-3',
          title: 'Patient Handouts',
          subtitle: 'Resources',
          cta: 'Download',
          icon: 'FileText',
          url: '/resources?category=handouts',
          external: false,
        },
        {
          id: 'qa-4',
          title: 'Billing Resources',
          subtitle: 'Documentation',
          cta: 'Download',
          icon: 'FileSpreadsheet',
          url: '/resources?category=billing',
          external: false,
        },
      ];
    } catch (error) {
      console.error('Error fetching quick access:', error);
      return [];
    }
  },

  /**
   * Get bookmarked resources for current user
   */
  async getBookmarkedResources(profileId: string): Promise<ResourceItem[]> {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;

      return (bookmarks || []).map(bookmark => ({
        id: bookmark.id,
        name: bookmark.resource_id,
        program: 'unknown', // Would need to join with resource table to get program
        url: '#' // Would need resource details to build URL
      }));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  },

  /**
   * Get recent activity list
   */
  async getRecentActivity(profileId: string, limit: number = 5): Promise<RecentActivity[]> {
    try {
      const { data: activities, error } = await supabase
        .from('recent_activity')
        .select('*')
        .eq('profile_id', profileId)
        .order('accessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (activities || []).map(activity => ({
        id: activity.id,
        name: activity.resource_name,
        program: activity.resource_type,
        accessedAtISO: activity.accessed_at || new Date().toISOString(),
        url: '#' // Would need resource details to build proper URL
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  /**
   * Get announcements
   */
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data: announcements, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (announcements || []).map(announcement => ({
        id: announcement.id.toString(),
        title: announcement.title || 'Announcement',
        body: announcement.body || '',
        dateISO: announcement.created_at
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },
};