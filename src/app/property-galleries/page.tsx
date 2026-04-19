'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PropertyGalleriesManagementPage } from '@/components/property-galleries';

export default function PropertyGalleriesPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <PropertyGalleriesManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}
