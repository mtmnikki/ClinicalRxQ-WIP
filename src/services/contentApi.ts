/**
 * DB-backed content API (PostgREST).
 * All responses use SELECT aliases so the app receives camelCase fields
 * while the database stays snake_case.
 */

import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';
import { authService } from './supabase';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildUrl(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${getSupabaseUrl()}/rest/v1${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
}

async function authHeaders(): Promise<HeadersInit> {
  const session = await authService.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: getSupabaseAnonKey(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Program = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  overview?: string | null;
  experienceLevel?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type FileItem = {
  fileId: string;
  programId?: string | null;
  programName?: string | null;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType?: string | null;
  category?: string | null;
  subcategory?: string | null;
  contentClass?: string | null;
  useCase?: string | null;
  medicalConditions?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

// SELECT aliases (snake_case -> camelCase)
const PROGRAM_SELECT =
  'id,slug,name,description,overview,experience_level:experienceLevel,created_at:createdAt,updated_at:updatedAt';
const FILE_SELECT =
  'id:fileId,program_id:programId,program_name:programName,file_name:fileName,file_path:filePath,file_url:fileUrl,mime_type:mimeType,form_category:category,form_subcategory:subcategory,content_class:contentClass,use_case:useCase,medical_conditions:medicalConditions,created_at:createdAt,updated_at:updatedAt';

// -----------------------------------------------------------------------------
// API functions
// -----------------------------------------------------------------------------

export async function listPrograms(): Promise<Program[]> {
  const headers = await authHeaders();
  const url = buildUrl('/programs', { select: PROGRAM_SELECT, order: 'slug.asc' });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listPrograms failed (${res.status})`);
  return res.json();
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const headers = await authHeaders();
  const url = buildUrl('/programs', {
    select: PROGRAM_SELECT,
    slug: `eq.${slug}`,
    limit: '1',
  });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`getProgramBySlug failed (${res.status})`);
  const rows = (await res.json()) as Program[];
  return rows[0] ?? null;
}

export async function listFilesByProgramId(
  programId: string,
  opts: { category?: string; subcategory?: string; q?: string; isVideo?: boolean } = {},
): Promise<FileItem[]> {
  const headers = await authHeaders();
  const params: Record<string, string> = {
    select: FILE_SELECT,
    program_id: `eq.${programId}`,
    order: 'category.asc,subcategory.asc,fileName.asc',
  };
  if (opts.category) params['form_category'] = `eq.${opts.category}`;
  if (opts.subcategory) params['form_subcategory'] = `eq.${opts.subcategory}`;
  if (opts.q) params['file_name'] = `ilike.%${opts.q}%`;
  const url = buildUrl('/storage_files_catalog', params);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listFilesByProgramId failed (${res.status})`);
  let rows = (await res.json()) as FileItem[];
  if (opts.isVideo != null) {
    const isVid = (m?: string | null) => !!m && m.toLowerCase().startsWith('video/');
    rows = rows.filter(r => (opts.isVideo ? isVid(r.mimeType) : !isVid(r.mimeType)));
  }
  return rows;
}

export async function listAllFiles(
  opts: { category?: string; subcategory?: string; q?: string; isVideo?: boolean } = {},
): Promise<FileItem[]> {
  const headers = await authHeaders();
  const params: Record<string, string> = {
    select: FILE_SELECT,
    order: 'programName.asc,category.asc,subcategory.asc,fileName.asc',
  };
  if (opts.category) params['form_category'] = `eq.${opts.category}`;
  if (opts.subcategory) params['form_subcategory'] = `eq.${opts.subcategory}`;
  if (opts.q) params['file_name'] = `ilike.%${opts.q}%`;
  const url = buildUrl('/storage_files_catalog', params);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listAllFiles failed (${res.status})`);
  let rows = (await res.json()) as FileItem[];
  if (opts.isVideo != null) {
    const isVid = (m?: string | null) => !!m && m.toLowerCase().startsWith('video/');
    rows = rows.filter(r => (opts.isVideo ? isVid(r.mimeType) : !isVid(r.mimeType)));
  }
  return rows;
}

export async function listAnnouncements(): Promise<{
  id: number;
  title: string | null;
  body: string | null;
  createdAt: string;
}[]> {
  const headers = await authHeaders();
  const url = buildUrl('/announcements', {
    select: 'id,title,body,created_at:createdAt',
    order: 'created_at.desc',
  });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listAnnouncements failed (${res.status})`);
  return res.json();
}

export async function listBookmarks(
  profileId: string,
): Promise<{
  id: string;
  profileId: string;
  resourceId: string;
  resourceType: string;
  createdAt: string | null;
}[]> {
  const headers = await authHeaders();
  const url = buildUrl('/bookmarks', {
    select: 'id,profile_id:profileId,resource_id:resourceId,resource_type:resourceType,created_at:createdAt',
    profile_id: `eq.${profileId}`,
  });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listBookmarks failed (${res.status})`);
  return res.json();
}

export function publicUrl(file: Pick<FileItem, 'fileUrl'>): string {
  return file.fileUrl;
}
