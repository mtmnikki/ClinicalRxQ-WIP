/**
 * DB-backed content API (PostgREST). Replaces legacy storageCatalog/staticCatalog.
 * - Uses SELECT aliases so app-level keys are camelCase while DB stays snake_case.
 * - Fetches via Supabase REST with anon key; server enforces RLS.
 */

import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';

/** Program entity (app-level camelCase) */
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

/** File row from storage_files_catalog (app-level camelCase) */
export type FileItem = {
  fileId: string;
  programId?: string | null;
  programSlug?: string | null;
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

function buildUrl(path: string, params: Record<string, string | undefined> = {}) {
  const base = getSupabaseUrl();
  if (!base) throw new Error('Supabase URL is not configured.');
  const url = new URL(`${base}/rest/v1${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') url.searchParams.set(k, v);
  }
  return url.toString();
}

function headers(): Record<string, string> {
  const anon = getSupabaseAnonKey();
  if (!anon) throw new Error('Supabase anon key is not configured.');
  return { apikey: anon, Authorization: `Bearer ${anon}` };
}

// SELECT alias strings (camelCase on the right-hand side)
const PROGRAM_SELECT =
  'id,slug,name,description,overview,experience_level:experienceLevel,created_at:createdAt,updated_at:updatedAt';

const STORAGE_SELECT = [
  'id:fileId',
  'program_id:programId',
  'file_name:fileName',
  'file_path:filePath',
  'file_url:fileUrl',
  'mime_type:mimeType',
  'form_category:category',
  'form_subcategory:subcategory',
  'content_class:contentClass',
  'use_case:useCase',
  'medical_conditions:medicalConditions',
  'created_at:createdAt',
  'updated_at:updatedAt',
].join(',');

export async function listPrograms(): Promise<Program[]> {
  const url = buildUrl('/programs', { select: PROGRAM_SELECT, order: 'slug.asc' });
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`listPrograms failed (${res.status})`);
  return (await res.json()) as Program[];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const url = buildUrl('/programs', {
    select: PROGRAM_SELECT,
    slug: `eq.${encodeURIComponent(slug)}`,
    limit: '1',
  });
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`getProgramBySlug failed (${res.status})`);
  const rows = (await res.json()) as Program[];
  return rows?.[0] || null;
}

type FileFilters = { category?: string; subcategory?: string; q?: string; isVideo?: boolean };

function buildFileQueryParams(filters?: FileFilters): Record<string, string> {
  const params: Record<string, string> = { select: STORAGE_SELECT, order: 'fileName.asc' };
  if (!filters) return params;
  if (filters.category) params['form_category'] = `eq.${filters.category}`;
  if (filters.subcategory) params['form_subcategory'] = `eq.${filters.subcategory}`;
  if (filters.q) params['file_name'] = `ilike.%${filters.q}%`;
  return params;
}

function applyVideoFilter(rows: FileItem[], isVideo?: boolean): FileItem[] {
  if (isVideo == null) return rows;
  const isVid = (m?: string | null) => !!m && m.toLowerCase().startsWith('video/');
  return rows.filter(r => (isVideo ? isVid(r.mimeType) : !isVid(r.mimeType)));
}

export async function listFilesByProgramId(programId: string, filters?: FileFilters): Promise<FileItem[]> {
  const params = buildFileQueryParams(filters);
  params['program_id'] = `eq.${encodeURIComponent(programId)}`;
  const url = buildUrl('/storage_files_catalog', params);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`listFilesByProgramId failed (${res.status})`);
  const data = (await res.json()) as FileItem[];
  return applyVideoFilter(data, filters?.isVideo);
}

export async function listAllFiles(filters?: FileFilters): Promise<FileItem[]> {
  const params = buildFileQueryParams(filters);
  const url = buildUrl('/storage_files_catalog', params);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`listAllFiles failed (${res.status})`);
  const data = (await res.json()) as FileItem[];
  return applyVideoFilter(data, filters?.isVideo);
}

export async function listAnnouncements(): Promise<{ id: number; title: string | null; body: string | null; createdAt: string }[]> {
  const url = buildUrl('/announcements', { select: 'id,title,body,created_at:createdAt', order: 'created_at.desc' });
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`listAnnouncements failed (${res.status})`);
  return (await res.json()) as any;
}

export async function listBookmarks(profileId: string): Promise<{ id: string; profileId: string; resourceId: string; resourceType: string; createdAt: string | null }[]> {
  const url = buildUrl('/bookmarks', {
    select: 'id,profile_id:profileId,resource_id:resourceId,resource_type:resourceType,created_at:createdAt',
    profile_id: `eq.${encodeURIComponent(profileId)}`,
  });
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`listBookmarks failed (${res.status})`);
  return (await res.json()) as any;
}

/** Convenience utility: make a public URL from a FileItem */
export function publicUrl(file: Pick<FileItem, 'fileUrl'>): string {
  return file.fileUrl;
}
