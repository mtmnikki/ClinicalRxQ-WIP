/**
 * Bookmark store (Zustand) 
 * - Purpose: Toggle and persist bookmarked resources in Supabase database
 * - Profile-based: Each profile has separate bookmarks (Netflix model)
 * - Real-time syncing with database
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database.types';

type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

interface BookmarkState {
  bookmarkIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  // Core methods
  isBookmarked: (resourceId: string) => boolean;
  toggle: (resourceId: string, profileId: string) => Promise<void>;
  loadBookmarks: (profileId: string) => Promise<void>;
  clear: (profileId: string) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkIds: new Set<string>(),
  isLoading: false,
  error: null,

  isBookmarked: (resourceId: string) => get().bookmarkIds.has(resourceId),

  loadBookmarks: async (profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('resource_id')
        .eq('profile_id', profileId);

      if (error) throw error;

      const ids = new Set(data?.map(b => b.resource_id) || []);
      set({ bookmarkIds: ids, isLoading: false });
    } catch (err: any) {
      console.error('Error loading bookmarks:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  toggle: async (resourceId: string, profileId: string) => {
    const { bookmarkIds } = get();
    const isCurrentlyBookmarked = bookmarkIds.has(resourceId);

    // Optimistic update
    const newIds = new Set(bookmarkIds);
    if (isCurrentlyBookmarked) {
      newIds.delete(resourceId);
    } else {
      newIds.add(resourceId);
    }
    set({ bookmarkIds: newIds });

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('profile_id', profileId)
          .eq('resource_id', resourceId);
        
        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            profile_id: profileId,
            resource_id: resourceId
          });
        
        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      // Revert optimistic update on error
      set({ bookmarkIds, error: err.message });
    }
  },

  clear: async (profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('profile_id', profileId);

      if (error) throw error;

      set({ bookmarkIds: new Set(), isLoading: false });
    } catch (err: any) {
      console.error('Error clearing bookmarks:', err);
      set({ error: err.message, isLoading: false });
    }
  }
}));
