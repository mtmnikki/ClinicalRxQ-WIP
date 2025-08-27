import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabaseConfig';
import { authService } from './supabase';
import type { AccountId } from '../types';

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

/** The canonical source of truth: the auth user's UUID */
export async function getAccountIdFromSession(): Promise<AccountId> {
  const session = await authService.getSession();
  if (!session?.user?.id) throw new Error('Missing user id in session');
  return session.user.id as AccountId;
}

/** Ensure a public.accounts row exists with id = auth.users.id (create if missing) */
export async function ensureAccountRow(): Promise<{ id: AccountId }> {
  const headers = await authHeaders();
  const session = await authService.getSession();
  const id = session!.user!.id as AccountId;
  const email = session!.user!.email ?? '';

  // Try fetch
  {
    const url = buildUrl('/accounts', { select: 'id', id: `eq.${id}`, limit: '1' });
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Fetch accounts failed (${res.status})`);
    const rows = (await res.json()) as { id: AccountId }[];
    if (rows[0]) return rows[0];
  }

  // Insert if missing
  {
    const url = buildUrl('/accounts', { select: 'id' });
    const body = { id, email }; // other columns default/null as needed
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Create account failed (${res.status})`);
    const rows = (await res.json()) as { id: AccountId }[];
    return rows[0];
  }
}