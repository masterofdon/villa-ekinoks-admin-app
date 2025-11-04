'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { VillaFacilitiesManagementPage } from '@/components/villa-facilities';

export default function VillaFacilitiesPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <VillaFacilitiesManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}
