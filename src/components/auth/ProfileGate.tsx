/**
 * ProfileGate - Enforces profile selection after authentication.
 *
 * This component is the user-facing part of the "Account vs. Profile" architecture.
 * It consumes both AuthContext and ProfileContext to decide what to render:
 * 1. A loading state while profiles are being fetched.
 * 2. A "Create Profile" screen if the account has no profiles.
 * 3. A "Select Profile" screen if profiles exist but none is active.
 * 4. The actual protected content (`children`) if an active profile is set.
 */
import React, { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AddProfileModal from '../profiles/AddProfileModal';

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const { activeProfile, profiles, isLoading, error, selectProfile } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading your profiles...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-red-600">Error Loading Profiles</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      </div>
    );
  }

  // 2. No Profiles Exist: Force user to create their first one.
  if (profiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Create Your First Profile</CardTitle>
            <CardDescription>
              To get started, please create a user profile for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAddModal(true)} className="w-full" size="lg">
              Create Profile
            </Button>
          </CardContent>
        </Card>
        <AddProfileModal open={showAddModal} onOpenChange={setShowAddModal} />
      </div>
    );
  }

  // 3. Profiles Exist, but None is Active: Force user to select one.
  if (!activeProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Select Your Profile</CardTitle>
            <CardDescription>Who is using ClinicalRxQ right now?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {profiles.map((profile) => (
              <button
                key={profile.profile_id}
                onClick={() => selectProfile(profile.profile_id)}
                className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div>
                  <h4 className="font-medium">{profile.first_name} {profile.last_name}</h4>
                  <p className="text-sm text-slate-600">{profile.profile_role}</p>
                </div>
                <div className="text-sm font-semibold text-blue-600">Select →</div>
              </button>
            ))}
             <div className="border-t pt-4 mt-2">
              <Button variant="outline" onClick={() => setShowAddModal(true)} className="w-full">
                Add Another Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        <AddProfileModal open={showAddModal} onOpenChange={setShowAddModal} />
      </div>
    );
  }

  // 4. Success: An active profile is set, so render the protected content.
  return <>{children}</>;
}

