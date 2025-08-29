/**
 * TrainingPlayer - Clean version using training_resources_view
 * - Purpose: Rich training layout for clinical programs
 * - Layout: Two-column (main video + sidebar playlist), responsive
 * - Features: Video player with navigation, progress tracking, duration display
 * - Data: Uses properly sorted training modules from training_resources_view
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Play, Film, CheckCircle2, Clock } from 'lucide-react';

// Training item interface (matches converted data from training_resources_view)
interface StorageFileItem {
  path: string;
  url: string;
  filename: string;
  title: string;
  duration?: string; // From training_resources_view 'length' field
}

/**
 * Props for TrainingPlayer
 */
export interface TrainingPlayerProps {
  /** Current program slug (used to key localStorage for last watched) */
  programSlug: string;
  /** Program display name */
  programName: string;
  /** Optional program description to show above player */
  programDescription?: string;
  /** All training videos (already sorted by sort_order from database) */
  items: StorageFileItem[];
}

/**
 * Convert a value to safe text
 */
function safeText(v: unknown): string {
  if (v === null || v === undefined) return '';
  try {
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint') return String(v);
    if (v instanceof Date) return v.toLocaleString();
    return '';
  } catch {
    return '';
  }
}

/**
 * Local storage helpers for last-watched index
 */
function storageKey(slug: string) {
  return `training:lastIndex:${slug}`;
}

function saveLastIndex(slug: string, i: number) {
  try {
    localStorage.setItem(storageKey(slug), String(i));
  } catch {}
}

function loadLastIndex(slug: string): number | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Single playlist row component
 */
function PlaylistRow({
  item,
  active,
  index,
  onSelect,
}: {
  item: StorageFileItem;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  const title = item.title || item.filename || `Module ${index + 1}`;
  
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'group w-full rounded-md border px-3 py-3 text-left transition-all duration-200',
        active 
          ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm' 
          : 'hover:bg-slate-50 hover:border-slate-300',
      ].join(' ')}
      aria-current={active ? 'true' : 'false'}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={[
              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
              active 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
            ].join(' ')}>
              {active ? <CheckCircle2 className="w-3 h-3" /> : index + 1}
            </div>
            <span className={[
              'truncate text-sm font-medium',
              active ? 'text-blue-900' : 'text-slate-800'
            ].join(' ')}>
              {title}
            </span>
          </div>
          {item.filename && item.filename !== title && (
            <div className="ml-8 truncate text-xs text-slate-500">
              {item.filename}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.duration && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {item.duration}
            </div>
          )}
          <Film className={[
            'h-4 w-4',
            active ? 'text-blue-600' : 'text-slate-400'
          ].join(' ')} />
        </div>
      </div>
    </button>
  );
}

/**
 * TrainingPlayer component
 */
export default function TrainingPlayer({
  programSlug,
  programName,
  programDescription,
  items,
}: TrainingPlayerProps) {
  // Videos are already sorted by database - use as-is
  const videos = items || [];
  
  // Select the video (remember per program)
  const initialIndex = (() => {
    const saved = loadLastIndex(programSlug);
    if (saved !== null && saved >= 0 && saved < videos.length) return saved;
    return 0;
  })();
  
  const [index, setIndex] = useState<number>(initialIndex);
  
  // Persist index when changed
  useEffect(() => {
    saveLastIndex(programSlug, index);
  }, [programSlug, index]);

  // When video list changes, clamp index
  useEffect(() => {
    if (index >= videos.length && videos.length > 0) {
      setIndex(0);
    }
  }, [videos, index]);

  const current = videos[index] || null;

  // Video element ref to reset position on change
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (el && current) {
      // Reset video to beginning but don't autoplay
      el.currentTime = 0;
    }
  }, [current?.url]);

  // Navigation
  const hasPrev = index > 0;
  const hasNext = index < videos.length - 1;
  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setIndex((i) => Math.min(videos.length - 1, i + 1));

  // Progress calculation
  const progressPercent = videos.length > 0 ? ((index + 1) / videos.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Main content */}
      <div className="md:col-span-8 space-y-4">
        {/* Header panel */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300" />
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <span>{programName}</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                Training
              </Badge>
              {videos.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {index + 1} of {videos.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          {programDescription && (
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-slate-600 leading-relaxed">{programDescription}</p>
              {/* Progress bar */}
              {videos.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Video player */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            {current ? (
              <div className="space-y-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100 shadow-inner">
                  <video
                    ref={videoRef}
                    key={current.url}
                    controls
                    preload="metadata"
                    className="h-full w-full rounded-lg"
                    src={current.url}
                    onEnded={hasNext ? handleNext : undefined} // Auto-advance to next video
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {safeText(current.title || current.filename)}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {current.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{current.duration}</span>
                        </div>
                      )}
                      <span>Module {index + 1} of {videos.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrev} 
                      disabled={!hasPrev}
                      className="bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleNext} 
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Film className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600 font-medium mb-1">No training videos available</p>
                <p className="text-sm text-slate-500">
                  Videos will appear here once they are added to this program.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar playlist */}
      <div className="md:col-span-4">
        <Card className="overflow-hidden sticky top-6">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Course Content</span>
              {videos.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {videos.length} modules
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {videos.length === 0 ? (
              <div className="p-6 text-center">
                <Film className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600 mb-1">No modules yet</p>
                <p className="text-xs text-slate-500">Training content will appear here</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[70vh]">
                <div className="p-3 space-y-2">
                  {videos.map((video, i) => (
                    <PlaylistRow
                      key={video.url}
                      item={video}
                      active={i === index}
                      index={i}
                      onSelect={() => setIndex(i)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}