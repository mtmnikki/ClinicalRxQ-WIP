/**
* Type definitions for ClinicalRxQ application (profiles & related)
*
* Conventions:
* - Database uses snake_case; the service layer aliases fields to camelCase on SELECT.
* - App/domain types below are camelCase and should be used throughout the UI.
* - Role enum strings MUST match Postgres enum labels exactly (case & spaces preserved).
*/


// =============================
// Accounts (app camelCase; PostgREST aliases map snake_case → camelCase)
// =============================
export type AccountId = string;


// DB column is text; constrain via union later if you formalize allowed states
export type SubscriptionStatus = string;


export interface Account {
id: AccountId; // DB: id (uuid) = auth.users.id
email: string; // DB: email
pharmacyName?: string; // DB: pharmacy_name
subscriptionStatus: SubscriptionStatus; // DB: subscription_status (text)
createdAt: string; // DB: created_at (timestamptz)
updatedAt: string; // DB: updated_at (timestamptz)
pharmacyPhone?: string; // DB: pharmacy_phone
address1?: string; // DB: address1
city?: string; // DB: city
state?: string; // DB: state
zipcode?: string; // DB: zipcode
}


// Ask PostgREST to alias DB snake_case → camelCase in responses for accounts
export const ACCOUNTS_SELECT = [
'id',
'email',
'pharmacy_name:pharmacyName',
'subscription_status:subscriptionStatus',
'created_at:createdAt',
'updated_at:updatedAt',
'pharmacy_phone:pharmacyPhone',
'address1',
'city',
'state',
'zipcode',
].join(',');

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: Module[];
  resources: Resource[];
  thumbnail: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  duration: string;
  order: number;
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  url: string;
  description: string;
  category: string;
}

// =============================
// Profiles
// =============================
/**
* EXACT Postgres enum labels (case & spaces matter)
* 'Pharmacist' | 'Pharmacist-PIC' | 'Pharmacy Technician' | 'Intern' | 'Pharmacy'
*/
export type ProfileRole =
| 'Pharmacist'
| 'Pharmacist-PIC'
| 'Pharmacy Technician'
| 'Intern'
| 'Pharmacy';


/** Canonical order for UI lists (matches DB order) */
export const PROFILE_ROLES_ORDER: ProfileRole[] = [
'Pharmacist',
'Pharmacist-PIC',
'Pharmacy Technician',
'Intern',
'Pharmacy',
];


/** Default role auto-created for every account */
export const DEFAULT_ACCOUNT_PROFILE_ROLE: ProfileRole = 'Pharmacy';


/** Ready-to-use options for a <Select> control */
export const ROLE_OPTIONS = PROFILE_ROLES_ORDER.map((value) => ({ value, label: value }));


/**
* Stored profile shape used across the app.
* Note: role may be null in DB, so the app model allows null.
*/
export interface PharmacyProfile {
id: string;
member_account_id: string;
role: ProfileRole | null; // DB column is nullable
firstName: string;
lastName: string;
phone?: string; // DB: phone_number
email?: string; // DB: profile_email
licenseNumber?: string; // DB: license_number
nabpEProfileId?: string; // DB: nabp_eprofile_id
is_active?: boolean; // DB soft-delete flag; not the “selected” UI concept
}


/** Create/edit payloads used by forms */
export interface CreateProfileData {
role: ProfileRole; // required for user-created profiles
firstName: string;
lastName: string;
phone?: string;
email?: string;
licenseNumber?: string;
nabpEProfileId?: string;
}


export interface ProfileFormData extends CreateProfileData {
// Same as CreateProfileData for forms
}