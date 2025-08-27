// TEMP STUB — legacy storage-based catalog is removed.
// This stub keeps the app compiling until pages are refactored to DB-backed contentApi.ts.
import { listPrograms } from '../services/contentApi';
import type { Program } from '../services/contentApi';

export type ProgramSlug = string;

// Old code imported this; keep it as an empty, read-only list so loops won't explode.
export const ProgramSlugs: readonly ProgramSlug[] = [];

// Helper to throw with a clear message at runtime if something still calls these.
function notImplemented(name: string): never {
  throw new Error(`${name} is removed. Use DB-backed contentApi.ts instead.`);
}

// Legacy exports some pages referenced — keep the signatures so imports compile.
export async function listProgramsFromStorage() {
  notImplemented('listProgramsFromStorage');
}

export async function getProgramResourcesGrouped(_slug: ProgramSlug) {
  notImplemented('getProgramResourcesGrouped');
}

export async function listProgramFiles(_slug: ProgramSlug) {
  notImplemented('listProgramFiles');
}

export async function listAll() {
  notImplemented('listAll');
}
