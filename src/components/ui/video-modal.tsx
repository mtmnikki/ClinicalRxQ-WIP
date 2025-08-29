/**
 * VideoModal - Elegant modal video player
 * - Purpose: Display videos in a modal overlay instead of new tabs
 * - Features: Centered video player, backdrop blur, ESC to close
 * - Design: Matches site styling with brand gradient accent
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Pause video when closing
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl mx-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300">
            <h3 className="text-lg font-semibold text-white truncate pr-4">
              {title || 'Video Player'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Video Container */}
          <div className="bg-black">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full max-h-[70vh]"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}