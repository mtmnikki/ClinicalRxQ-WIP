/**
 * ProgramResourceRow - Dense, clean resource display
 * - Desktop-optimized: Tight spacing for maximum content visibility
 * - Minimal: Icon + filename (+ duration for videos) + action button only
 * - Videos show in modal, documents download
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Download, Play, FileText, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import SafeText from '../common/SafeText';
import VideoModal from '../ui/video-modal';
import { useBookmarkStore } from '../../stores/bookmarkStore';
import { useProfile } from '../../contexts/ProfileContext';
import { activityService } from '../../lib/supabaseClient';

// Interface for resource items
interface StorageFileItem {
  file_name: string;
  file_url: string;
  resource_type: string;
  length?: string; // Duration for training modules
  file_id?: string; // For bookmarking
}

/**
 * ProgramResourceRow component - Dense desktop layout
 */
export default function ProgramResourceRow({ item }: { item: StorageFileItem }) {
  const { activeProfile } = useProfile();
  const { isBookmarked, toggle, loadBookmarks } = useBookmarkStore();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const isVideo = item.resource_type === 'training_module';
  const isSaved = item.file_id ? isBookmarked(item.file_id) : false;
  
  // Remove file extension for cleaner display
  const displayName = item.file_name.replace(/\.[^/.]+$/, '');

  // Load bookmarks when profile changes
  useEffect(() => {
    if (activeProfile?.profile_id) {
      loadBookmarks(activeProfile.profile_id);
    }
  }, [activeProfile?.profile_id, loadBookmarks]);

  const handleAction = async () => {
    // Track file access
    if (activeProfile?.profile_id && item.file_id) {
      await activityService.trackFileAccess(item.file_id, activeProfile.profile_id);
    }

    if (isVideo) {
      setIsVideoModalOpen(true);
    } else {
      // Download document
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleToggleBookmark = async () => {
    if (activeProfile?.profile_id && item.file_id) {
      await toggle(item.file_id, activeProfile.profile_id);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded border bg-white px-3 py-2 hover:shadow-sm transition-shadow">
        {/* Left: Icon + Name (+ Duration for videos) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex-shrink-0">
            {isVideo ? (
              <Play className="h-4 w-4 text-white" />
            ) : (
              <FileText className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-slate-900 truncate">
              <SafeText text={displayName} />
            </span>
            {isVideo && item.length && (
              <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                {item.length}
              </span>
            )}
          </div>
        </div>

        {/* Right: Bookmark + Action buttons */}
        <div className="flex items-center gap-2">
          {item.file_id && (
            <button
              onClick={handleToggleBookmark}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 flex-shrink-0"
              title={isSaved ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isSaved ? <BookmarkCheck className="h-3 w-3 text-blue-600" /> : <Bookmark className="h-3 w-3" />}
            </button>
          )}
          <Button 
            size="sm" 
            onClick={handleAction}
            className="h-7 px-2 text-xs flex-shrink-0"
          >
            {isVideo ? (
              <>
                <Play className="mr-1 h-3 w-3" />
                Play
              </>
            ) : (
              <>
                <Download className="mr-1 h-3 w-3" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Video Modal */}
      {isVideo && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoUrl={item.file_url}
          title={displayName}
        />
      )}
    </>
  );
}