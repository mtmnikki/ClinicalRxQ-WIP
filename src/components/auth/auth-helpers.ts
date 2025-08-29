// auth-helpers.ts - TypeScript utility functions for authentication
import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

export interface Account {
  id: string;
  email: string;
  pharmacy_name?: string;
  subscription_status: string;
  created_at?: string;
  updated_at?: string;
  pharmacy_phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface MemberProfile {
  id: string;
  member_account_id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_email?: string;
  license_number?: string;
  nabp_eprofile_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  role?: string;
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to handle login with email and password
export async function loginWithEmail(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email, 
      password
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Fetch the account information for the authenticated user
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (accountError) {
      return new Response(
        JSON.stringify({ error: 'Error fetching account data' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Get member profiles associated with this account
    const { data: profilesData, error: profilesError } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('member_account_id', data.user.id);

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: 'Error fetching member profiles' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ 
        session: data.session, 
        user: data.user,
        account: accountData,
        profiles: profilesData || []
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}

// Function to fetch member profiles for an account
export async function getMemberProfiles(req: Request) {
  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get('accountId');
    
    if (!accountId) {
      return new Response(
        JSON.stringify({ error: "Account ID is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('member_account_id', accountId);

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: 'Error fetching member profiles' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ profiles: profilesData || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}
