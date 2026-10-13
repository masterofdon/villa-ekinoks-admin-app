'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PropertyRentablesManagementPage } from '@/components/property-rentables';

export default function PropertyRentablesPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <PropertyRentablesManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}
