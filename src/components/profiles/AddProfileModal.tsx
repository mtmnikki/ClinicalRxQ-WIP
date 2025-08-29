/**
 * AddProfileModal
 * - Purpose: Create or edit a Pharmacy Profile via a modal form.
 * - Required fields: Role, First Name, Last Name.
 * - Optional fields include phone, email, DOB (MM/DD/YYYY), License Number, and NABP e-Profile ID.
 * - Validation: Only enforce required fields; optional fields validated lightly if provided.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/authStore';
import { useProfile } from '../../contexts/ProfileContext';
import type { PharmacyProfile, ProfileRole } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/**
 * Roles displayed in the dropdown (label = value).
 */
const ROLE_OPTIONS: ProfileRole[] = [
  'Pharmacist',
  'Pharmacist-PIC',
  'Pharmacy Technician',
  'Intern',
  'Pharmacy',
];

/**
 * Zod schema with only the required fields strictly validated.
 * Optional fields accept empty string; if present, they must match a reasonable pattern.
 */
const schema = z.object({
  role: z.enum(['Pharmacist', 'Pharmacist-PIC', 'Pharmacy Technician', 'Intern', 'Pharmacy'], {
    required_error: 'Role is required',
  }),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+()\-\s]{7,}$/.test(v), { message: 'Invalid phone number' }),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), { message: 'Invalid email' }),
  licenseNumber: z.string().optional(),
  nabpEProfileId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddProfileModalProps {
  /** Control whether the dialog is open */
  open: boolean;
  /** Handler to update the open state */
  onOpenChange: (open: boolean) => void;
  /** When provided, the modal operates in edit mode */
  profileId?: string;
  /** Default values for editing (or prefill) */
  defaultValues?: Partial<PharmacyProfile>;
  /** Callback after profile creation (used by ProfileGate) */
  onCreated?: (id: string) => void;
}

/**
 * AddProfileModal component
 */
export default function AddProfileModal({
  open,
  onOpenChange,
  profileId,
  defaultValues,
  onCreated,
}: AddProfileModalProps) {
  const { user } = useAuthStore();
  const { createProfile, updateProfile, isLoading, error } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: (defaultValues?.role as ProfileRole) || undefined,
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      licenseNumber: defaultValues?.licenseNumber || '',
      nabpEProfileId: defaultValues?.nabpEProfileId || '',
    },
  });

  const watchedRole = watch('role');

  useEffect(() => {
    // When switching open/edit target, refresh the form defaults
    if (open) {
      clearError(); // Clear any previous errors
      reset({
        role: (defaultValues?.role as ProfileRole) || undefined,
        firstName: defaultValues?.firstName || '',
        lastName: defaultValues?.lastName || '',
        phone: defaultValues?.phone || '',
        email: defaultValues?.email || '',
        licenseNumber: defaultValues?.licenseNumber || '',
        nabpEProfileId: defaultValues?.nabpEProfileId || '',
      });
    }
  }, [open, defaultValues, reset, clearError]);

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;

    try {
      if (profileId) {
        // Edit existing profile
        const { error } = await updateProfile(profileId, {
          profile_role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phone || null,
          profile_email: values.email || null,
          license_number: values.licenseNumber || null,
          nabp_eprofile_id: values.nabpEProfileId || null,
        });
        if (error) return; // Error handled by context
      } else {
        // Create new profile
        const { profile, error } = await createProfile({
          profile_role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phone || null,
          profile_email: values.email || null,
          license_number: values.licenseNumber || null,
          nabp_eprofile_id: values.nabpEProfileId || null,
        });
        
        if (profile) {
          onCreated?.(profile.profile_id);
        } else {
          return; // Error handled by context
        }
      }

      onOpenChange(false);
    } catch (error) {
      // Additional error handling if needed
      console.error('Profile operation failed:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{profileId ? 'Edit Profile' : 'Add Profile'}</DialogTitle>
          <DialogDescription>
            Only Role, First Name, and Last Name are required. You can add other details now or later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-red-600">*</span>
            </Label>
            <Select 
              value={watchedRole || ''} 
              onValueChange={(value) => setValue('role', value as ProfileRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-600">*</span>
              </Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-600">*</span>
              </Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input id="email" type="email" placeholder="user@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          {/* License + NABP */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" placeholder="RPH12345" {...register('licenseNumber')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nabpEProfileId">NABP e-Profile ID</Label>
              <Input id="nabpEProfileId" placeholder="12345678" {...register('nabpEProfileId')} />
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {profileId ? 'Save Changes' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
