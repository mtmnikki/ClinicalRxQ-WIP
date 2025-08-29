/**
 * ProfilesTable
 * - Purpose: Display the list of profiles for the authenticated member account.
 * - Actions per row: Edit, Remove.
 * - Uses AddProfileModal for editing by passing defaultValues + profileId.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import AddProfileModal from './AddProfileModal';

/**
 * Human-readable full name helper.
 */
function fullName(p: any) {
  return `${p.first_name} ${p.last_name}`.trim();
}

/**
 * ProfilesTable component
 */
export default function ProfilesTable() {
  const { activeProfile, profiles, selectProfile, updateProfile, fetchProfiles, isLoading } = useProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const rows = useMemo(() => profiles.slice().sort((a, b) => fullName(a).localeCompare(fullName(b))), [profiles]);

  function handleEdit(p: any) {
    setEditing(p);
    setEditOpen(true);
  }

  async function handleRemove(p: any) {
    const confirmed = window.confirm(`Remove profile "${fullName(p)}"?`);
    if (confirmed) {
      try {
        // Delete from database
        const { error } = await supabase
          .from('member_profiles')
          .delete()
          .eq('profile_id', p.profile_id);
        
        if (error) throw error;
        
        // Refresh profiles list
        await fetchProfiles();
      } catch (error) {
        console.error('Error removing profile:', error);
        alert('Failed to remove profile. Please try again.');
      }
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Phone</th>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">License #</th>
            <th className="px-3 py-2 font-medium">NABP ID</th>
            <th className="px-3 py-2 font-medium">Active</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-slate-600">
                No profiles yet. Click "Add Profile" to create one.
              </td>
            </tr>
          ) : (
            rows.map((p) => (
              <tr key={p.profile_id} className="hover:bg-slate-50/60">
                <td className="px-3 py-2">{fullName(p)}</td>
                <td className="px-3 py-2">{p.profile_role}</td>
                <td className="px-3 py-2">{p.phone_number || '—'}</td>
                <td className="px-3 py-2">{p.profile_email || '—'}</td>
                <td className="px-3 py-2">{p.license_number || '—'}</td>
                <td className="px-3 py-2">{p.nabp_eprofile_id || '—'}</td>
                <td className="px-3 py-2">
                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
                      activeProfile?.profile_id === p.profile_id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'h-1.5 w-1.5 rounded-full',
                        activeProfile?.profile_id === p.profile_id ? 'bg-green-600' : 'bg-slate-400',
                      ].join(' ')}
                    />
                    {activeProfile?.profile_id === p.profile_id ? 'Selected' : 'Not selected'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    {activeProfile?.profile_id !== p.profile_id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 bg-transparent"
                        onClick={() => selectProfile(p.profile_id)}
                      >
                        Use
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="h-8 px-2 bg-transparent" onClick={() => handleEdit(p)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="h-8 px-2" onClick={() => handleRemove(p)}>
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit modal reusing AddProfileModal */}
      <AddProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        profileId={editing?.profile_id}
        defaultValues={editing ? {
          role: editing.profile_role,
          firstName: editing.first_name,
          lastName: editing.last_name,
          phone: editing.phone_number,
          email: editing.profile_email,
          licenseNumber: editing.license_number,
          nabpEProfileId: editing.nabp_eprofile_id,
        } : undefined}
      />
    </div>
  );
}
