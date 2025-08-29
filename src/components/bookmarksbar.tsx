/**
 * ProfileBookmarksPanel
 * - Floating bookmark button that opens a right-side drawer listing bookmarked resources.
 * - Uses Supabase database with profile-based bookmarks (Netflix model).
 * - Integrates with ProfileContext and updated bookmark store.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Download, Play, Search, Trash2, X } from 'lucide-react'
import { useBookmarkStore } from '../stores/bookmarkStore'
import { useProfile } from '../contexts/ProfileContext'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../types/database.types'

type StorageFile = {
  id: string
  name: string
  fileUrl: string
  program?: string
  type?: string
  category?: string
  tags?: string[]
}

/** Filter helper for video-like URLs */
function isVideoUrl(url?: string) {
  const u = (url || '').toLowerCase()
  return ['.mp4', '.mov', '.m4v', '.webm', '.m3u8'].some((ext) => u.endsWith(ext))
}

/**
 * Row for a single bookmarked item.
 */
const BookmarkRow: React.FC<{
  item: StorageFile
  onRemove: (it: StorageFile) => void
}> = ({ item, onRemove }) => {
  const isVideo = isVideoUrl(item.fileUrl)

  return (
    <li className="group flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px]',
              'bg-slate-100 text-slate-700',
            ].join(' ')}
          >
            {item.program ? String(item.program).toUpperCase() : 'GENERAL'}
          </span>
          {item.type ? (
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
              {item.type}
            </span>
          ) : null}
        </div>
        <div className="mb-1 truncate text-sm font-medium text-slate-900">{item.name}</div>
        {item.fileUrl ? (
          <div className="text-xs text-slate-500 break-all">{item.fileUrl}</div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50"
            title={isVideo ? 'Play video' : 'Download file'}
          >
            {isVideo ? <Play className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="inline-flex h-8 items-center justify-center rounded-md border border-red-300 bg-red-50 px-2 text-xs text-red-700 hover:bg-red-100"
          title="Remove bookmark"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

/**
 * Floating button + drawer with bookmarked resources
 */
const ProfileBookmarksPanel: React.FC<{ className?: string }> = () => {
  const { activeProfile } = useProfile()
  const { bookmarkIds, loadBookmarks, toggle } = useBookmarkStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<StorageFile[]>([])

  const load = async () => {
    if (!activeProfile?.profile_id) return
    
    setLoading(true)
    try {
      // Load bookmark IDs first
      await loadBookmarks(activeProfile.profile_id)
      
      // Get detailed file info for bookmarked items
      if (bookmarkIds.size > 0) {
        const { data, error } = await supabase
          .from('storage_files_catalog')
          .select('*')
          .in('file_id', Array.from(bookmarkIds))

        if (error) throw error

        const mappedItems: StorageFile[] = data?.map(file => ({
          id: file.file_id,
          name: file.file_name,
          fileUrl: file.file_url,
          program: file.program_name || undefined,
          type: file.resource_type || undefined,
          category: file.category || undefined,
          tags: []
        })) || []

        setItems(mappedItems)
      } else {
        setItems([])
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && activeProfile?.profile_id) {
      load()
    }
  }, [open, activeProfile?.profile_id, bookmarkIds])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((r) => {
      const hay = [
        r.name,
        r.program || '',
        r.type || '',
        r.category || '',
        ...(r.tags || []),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, search])

  const handleRemove = async (it: StorageFile) => {
    if (!activeProfile?.profile_id) return
    
    try {
      await toggle(it.id, activeProfile.profile_id)
      await load() // Refresh the list
    } catch (e) {
      console.error('Remove bookmark failed', e)
    }
  }

  return (
    <>
      {/* Floating FAB */}
      <button
        type="button"
        aria-label="Open bookmarked resources"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-3 text-slate-700 shadow-lg transition hover:bg-slate-50"
      >
        <Bookmark className="h-5 w-5" />
        {items.length > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blue-600 px-1 text-center text-[11px] font-semibold leading-5 text-white">
            {items.length}
          </span>
        ) : null}
      </button>

      {/* Drawer */}
      {open ? (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bookmarked Resources"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">Bookmarked Resources</h2>
                <span className="text-xs text-slate-500">({items.length})</span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-slate-200 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookmarked files..."
                  className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none ring-0 transition focus:border-blue-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex h-[calc(100%-124px)] flex-col overflow-hidden">
              {loading ? (
                <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-600">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-900">
                      {search ? 'No results' : 'No bookmarked files yet'}
                    </div>
                    <p className="mx-auto max-w-xs text-xs text-slate-600">
                      {search ? 'Try a different search term.' : 'Bookmark resources to see them here.'}
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="flex-1 overflow-y-auto space-y-2 p-3">
                  {filtered.map((it) => (
                    <BookmarkRow key={it.id} item={it} onRemove={handleRemove} />
                  ))}
                </ul>
              )}

              <div className="border-t border-slate-200 p-3">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}

export default ProfileBookmarksPanel
