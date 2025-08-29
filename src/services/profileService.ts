// src/services/profileService.ts
import { supabase } from '../lib/supabaseClient'

export type MemberProfile = {
  id: string
  memberAccountId: string | null
  role: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  licenseNumber: string | null
  nabpEProfileId: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

function mapRow(r: any): MemberProfile {
  return {
    id: r.id,
    memberAccountId: r.member_account_id ?? null,
    role: r.role ?? null,
    firstName: r.first_name ?? null,
    lastName: r.last_name ?? null,
    phone: r.phone_number ?? null,
    email: r.profile_email ?? null,
    licenseNumber: r.license_number ?? null,
    nabpEProfileId: r.nabp_eprofile_id ?? null,
    isActive: !!r.is_active,
    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,
  }
}

export async function getProfilesForAccount(accountId: string): Promise<MemberProfile[]> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select(
      [
        'id',
        'member_account_id',
        'role',
        'first_name',
        'last_name',
        'phone_number',
        'profile_email',
        'license_number',
        'nabp_eprofile_id',
        'is_active',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('member_account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

// Optional convenience: fetch active-by-email
export async function getActiveProfileByEmail(email: string): Promise<MemberProfile | null> {
  const { data, error } = await supabase
    .from('member_profiles')
    .select(
      [
        'id',
        'member_account_id',
        'role',
        'first_name',
        'last_name',
        'phone_number',
        'profile_email',
        'license_number',
        'nabp_eprofile_id',
        'is_active',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('profile_email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return data ? mapRow(data) : null
}