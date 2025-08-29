/**
 * My Account page
 * - Updated to use AppShell with a fixed MemberSidebar (static frame on gated pages).
 * - Preserves previous content and breadcrumbs inside the AppShell content area.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User as UserIcon, Settings, CreditCard, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import SafeText from '../components/common/SafeText';
import Breadcrumbs from '../components/common/Breadcrumbs';
import AppShell from '../components/layout/AppShell';
import MemberSidebar from '../components/layout/MemberSidebar';
import ProfilesTable from '../components/profiles/ProfilesTable';
import AddProfileModal from '../components/profiles/AddProfileModal';

export default function Account() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const [showAddProfile, setShowAddProfile] = React.useState(false);

  /** Header renderer for AppShell */
  const header = (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-4">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Account' },
        ]}
        className="mb-2"
      />
      <div className="mb-1 text-2xl font-bold">My Account</div>
      <div className="text-sm text-gray-600">Manage your profile and billing</div>
    </div>
  );

  return (
    <AppShell sidebar={<MemberSidebar />} header={header}>
      <div className="space-y-6">
        {/* Current Profile Info */}
        {activeProfile && (
          <Card className="bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Current Active Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {activeProfile.first_name} {activeProfile.last_name}
                  </p>
                  <p className="text-blue-700 font-medium">{activeProfile.profile_role}</p>
                  {activeProfile.profile_email && (
                    <p className="text-sm text-gray-600">{activeProfile.profile_email}</p>
                  )}
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profiles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Profiles
              </div>
              <Button onClick={() => setShowAddProfile(true)} size="sm">
                Add Profile
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage user profiles for your pharmacy account. All roles have equal access to ClinicalRxQ resources.
              </p>
              <ProfilesTable />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    className="w-full rounded-md border p-2"
                    readOnly
                  />
                </div>
                <p className="text-sm text-gray-600">
                  This is your account login email. Contact support to change it.
                </p>
              </div>
            </CardContent>
          </Card>
      </div>

      <AddProfileModal
        open={showAddProfile}
        onOpenChange={setShowAddProfile}
      />
    </div>
    </AppShell>
  );
}
