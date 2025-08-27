/**
 * DB-backed content API (PostgREST). Replaces legacy storageCatalog/staticCatalog.
 * - Reads from Supabase tables with SELECT aliases so responses are camelCase.
 * - Storage is only for bytes/URLs; selection/filters come from tables.
 */

import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';
import { authService } from './supabase';

// ---- Helpers ---------------------------------------------------------------

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

// ---- Types (local to this API) --------------------------------------------

export type Program = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  overview?: string | null;
  experienceLevel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileItem = {
  id: string;
  bucketName: string;
  filePath: string;
  fileUrl: string;
  fileName: string;
  mimeType: string | null;
  category: string | null;
  subcategory: string | null;
  programId: string | null;
  programSlug?: string | null;
  programName?: string | null;
  contentClass?: string | null;
  createdAt: string;
  updatedAt: string;
};

// SELECT aliases (snake_case DB -> camelCase app)
const PROGRAMS_SELECT = [
  'id',
  'slug',
  'name',
  'description',
  'overview',
  'experience_level:experienceLevel',
  'created_at:createdAt',
  'updated_at:updatedAt',
].join(',');

const STORAGE_SELECT = [
  'id',
  'bucket_name:bucketName',
  'file_name:fileName',
  'file_path:filePath',
  'file_url:fileUrl',
  'file_size',
  'mime_type:mimeType',
  'last_modified',
  'created_at:createdAt',
  'updated_at:updatedAt',
  'category',
  'subcategory',
  'program_id:programId',
  'program_name:programName',
  'content_class:contentClass',
].join(',');

// ---- API -------------------------------------------------------------------

/** List all programs (ordered by name) */
export async function listPrograms(): Promise<Program[]> {
  const headers = await authHeaders();
  const url = buildUrl('/programs', { select: PROGRAMS_SELECT, order: 'name.asc' });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listPrograms failed (${res.status})`);
  return res.json();
}

/** Get one program by slug */
export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const headers = await authHeaders();
  const url = buildUrl('/programs', {
    select: PROGRAMS_SELECT,
    slug: `eq.${slug}`,
    limit: '1',
  });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`getProgramBySlug failed (${res.status})`);
  const rows = (await res.json()) as Program[];
  return rows[0] ?? null;
}

/** List files for a given program slug (pulls program id, then files) */
export async function listFilesByProgramSlug(slug: string): Promise<FileItem[]> {
  const program = await getProgramBySlug(slug);
  if (!program) return [];
  const headers = await authHeaders();
  const url = buildUrl('/storage_files_catalog', {
    select: STORAGE_SELECT,
    program_id: `eq.${program.id}`,
    order: 'category.asc,subcategory.asc,fileName.asc',
  });
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`listFilesByProgramSlug failed (${res.status})`);
  const rows = (await res.json()) as FileItem[];
  // enrich with program slug/name for convenience
  return rows.map(r => ({ ...r, programSlug: program.slug, programName: program.name }));
}

/** List all files (optionally filter) — used by Resources page */
export async function listAllFiles(opts: {
  q?: string;
  category?: string;
  subcategory?: string;
  isVideo?: boolean;
} = {}): Promise<FileItem[]> {
  const headers = await authHeaders();
  const params: Record<string, string> = {
    select: STORAGE_SELECT,
    order: 'programName.asc,category.asc,subcategory.asc,fileName.asc',
  };
  if (opts.category) params['category'] = `eq.${opts.category}`;
  if (opts.subcategory) params['subcategory'] = `eq.${opts.subcategory}`;
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

/** Build a public URL (if you prefer to compute rather than store fileUrl) */
export function publicUrl(file: Pick<FileItem, 'fileUrl'>): string {
  return file.fileUrl;
}