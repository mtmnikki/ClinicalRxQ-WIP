/**
 * Minimal Supabase Storage utilities
 * Provides types and helper functions for storage operations
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Represents a file item from Supabase storage
 */
export interface StorageFileItem {
  path: string;
  url: string;
  filename: string;
  title: string;
  mimeType?: string;
  size?: number;
}

/**
 * Build a public URL for a file in Supabase storage
 */
export function buildPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from('clinicalrxqfiles')
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get storage URL helper
 */
export function getStorageUrl(path: string): string {
  return buildPublicUrl(path);
}

/**
 * File type checking utilities
 */
export function isVideo(item: StorageFileItem): boolean {
  const mime = item.mimeType?.toLowerCase() || '';
  const ext = item.filename.toLowerCase().split('.').pop() || '';
  return mime.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
}

export function isPdf(item: StorageFileItem): boolean {
  const mime = item.mimeType?.toLowerCase() || '';
  const ext = item.filename.toLowerCase().split('.').pop() || '';
  return mime === 'application/pdf' || ext === 'pdf';
}

export function isDoc(item: StorageFileItem): boolean {
  const mime = item.mimeType?.toLowerCase() || '';
  const ext = item.filename.toLowerCase().split('.').pop() || '';
  return (
    mime.includes('word') ||
    mime.includes('document') ||
    ['doc', 'docx'].includes(ext)
  );
}

export function isSpreadsheet(item: StorageFileItem): boolean {
  const mime = item.mimeType?.toLowerCase() || '';
  const ext = item.filename.toLowerCase().split('.').pop() || '';
  return (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  );
}

/**
 * Strip file extension from filename (preserves everything before last dot)
 */
export function stripOneExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}