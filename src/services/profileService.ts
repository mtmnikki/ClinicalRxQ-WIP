/**
 * Profile Service — Supabase (PostgREST) with camelCase SELECT aliases
 *
 * Guarantees that responses already match the app's camelCase types defined in /src/types/index.ts
 * and that requests use snake_case keys expected by the DB schema.
 */

import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';
import { authService } from './supabase';
import type { PharmacyProfile, CreateProfileData, ProfileRole } from '../types';

// Generic API response shape
export type ApiResponse<T> = { data: T | null; error: string | null };

// PostgREST SELECT clause with aliases (DB snake_case -> app camelCase)
const PROFILE_SELECT = [
  'id',
  'member_account_id:memberAccountId',
  'role',
  'first_name:firstName',
  'last_name:lastName',
  'phone_number:phone',
  'profile_email:email',
  'license_number:licenseNumber',
  'nabp_eprofile_id:nabpEProfileId',
  'is_active:is_active',
  'created_at:createdAt',
  'updated_at:updatedAt',
].join(',');

function buildUrl(path: string, params: Record<string, string | number | boolean | undefined> = {}): URL {
  const base = getSupabaseUrl();
  const url = new URL(`${base}/rest/v1${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url;
}

async function authHeaders(): Promise<HeadersInit> {
  const anon = getSupabaseAnonKey();
  const session = await authService.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('User not authenticated. Please log in again.');
  return {
    'Authorization': `Bearer ${accessToken}`,
    'apikey': anon,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

function toIntOrNull(v?: string): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

// Public API
export const profileService = {
  /** List active profiles for a given account (auth user id) */
  async getProfilesForAccount(memberAccountId: string): Promise<ApiResponse<PharmacyProfile[]>> {
    try {
      const headers = await authHeaders();
      const url = buildUrl('/member_profiles', {
        select: PROFILE_SELECT,
        member_account_id: `eq.${memberAccountId}`,
        is_active: 'eq.true',
        order: 'created_at.asc',
      });
      const res = await fetch(url, { headers });
      if (!res.ok) return { data: null, error: `Failed to fetch profiles (${res.status})` };
      const data = (await res.json()) as PharmacyProfile[];
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message ?? String(e) };
    }
  },

  /** Get a single active profile by id */
  async getProfileById(profileId: string): Promise<ApiResponse<PharmacyProfile>> {
    try {
      const headers = await authHeaders();
      const url = buildUrl('/member_profiles', {
        select: PROFILE_SELECT,
        id: `eq.${profileId}`,
        is_active: 'eq.true',
        limit: 1,
      });
      const res = await fetch(url, { headers });
      if (!res.ok) return { data: null, error: `Failed to fetch profile (${res.status})` };
      const rows = (await res.json()) as PharmacyProfile[];
      const row = rows?.[0];
      if (!row) return { data: null, error: 'Profile not found' };
      return { data: row, error: null };
    } catch (e: any) {
      return { data: null, error: e.message ?? String(e) };
    }
  },

  /** Create a profile for the given account id */
  async createProfile(memberAccountId: string, data: CreateProfileData): Promise<ApiResponse<PharmacyProfile>> {
    try {
      const headers = await authHeaders();
      const body = {
        member_account_id: memberAccountId,
        role: data.role as ProfileRole, // exact DB enum label
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone ?? null,
        profile_email: data.email ?? null,
        license_number: data.licenseNumber ?? null,
        nabp_eprofile_id: data.nabpEProfileId ?? null,
      };
      const url = buildUrl('/member_profiles', { select: PROFILE_SELECT });
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) return { data: null, error: `Create failed (${res.status})` };
      const rows = (await res.json()) as PharmacyProfile[];
      return { data: rows?.[0] ?? null, error: null };
    } catch (e: any) {
      return { data: null, error: e.message ?? String(e) };
    }
  },

  /** Update fields on a profile (PATCH). Only sends provided fields. */
  async updateProfile(profileId: string, updates: Partial<CreateProfileData>): Promise<ApiResponse<PharmacyProfile>> {
    try {
      const headers = await authHeaders();
      const patch: Record<string, any> = {};
      if (updates.role !== undefined) patch.role = updates.role as ProfileRole; // exact enum
      if (updates.firstName !== undefined) patch.first_name = updates.firstName;
      if (updates.lastName !== undefined) patch.last_name = updates.lastName;
      if (updates.phone !== undefined) patch.phone_number = updates.phone ?? null;
      if (updates.email !== undefined) patch.profile_email = updates.email ?? null;
      if (updates.licenseNumber !== undefined) patch.license_number = updates.licenseNumber ?? null;
      if (updates.nabpEProfileId !== undefined) patch.nabp_eprofile_id = updates.nabpEProfileId ?? null;

      const url = buildUrl('/member_profiles', { select: PROFILE_SELECT, id: `eq.${profileId}` });
      const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(patch) });
      if (!res.ok) return { data: null, error: `Update failed (${res.status})` };
      const rows = (await res.json()) as PharmacyProfile[];
      return { data: rows?.[0] ?? null, error: null };
    } catch (e: any) {
      return { data: null, error: e.message ?? String(e) };
    }
  },

  /** Soft-delete: set is_active=false */
  async deleteProfile(profileId: string): Promise<ApiResponse<null>> {
    try {
      const headers = await authHeaders();
      const url = buildUrl('/member_profiles', { id: `eq.${profileId}` });
      const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ is_active: false }) });
      if (!res.ok) return { data: null, error: `Delete failed (${res.status})` };
      return { data: null, error: null };
    } catch (e: any) {
      return { data: null, error: e.message ?? String(e) };
    }
  },
};