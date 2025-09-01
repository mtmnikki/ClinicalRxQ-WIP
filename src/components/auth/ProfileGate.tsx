/**
 * ProfileGate - Optional profile selection after authentication.
 *
 * Profiles are a luxury feature for individual progress tracking.
 * Authenticated accounts can always access member content.
 * This component offers profile management but never blocks access.
 */
import React, { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import AddProfileModal from '../profiles/AddProfileModal';

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  // Simply render children - no profile blocking whatsoever
  // Profile selection/management is handled elsewhere (Account page, header, etc.)
  return <>{children}</>;
}

