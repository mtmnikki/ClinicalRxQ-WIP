/**
 * ProgramResourceRow - Dense, clean resource display
 * - Desktop-optimized: Tight spacing for maximum content visibility
 * - Minimal: Icon + filename (+ duration for videos) + action button only
 * - Videos show in modal, documents download
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Download, Play, FileText, Clock } from 'lucide-react';
import SafeText from '../common/SafeText';
import VideoModal from '../ui/video-modal';

// Interface for resource items
interface StorageFileItem {
  file_name: string;
  file_url: string;
  resource_type: string;
  length?: string; // Duration for training modules
}

/**
 * ProgramResourceRow component - Dense desktop layout
 */
export default function ProgramResourceRow({ item }: { item: StorageFileItem }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const isVideo = item.resource_type === 'training_module';
  
  // Remove file extension for cleaner display
  const displayName = item.file_name.replace(/\.[^/.]+$/, '');

  const handleAction = () => {
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

        {/* Right: Action button */}
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