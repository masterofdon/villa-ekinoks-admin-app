'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ServicableItemsManagementPage } from '@/components/servicable-items';

export default function ServicableItemsPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <ServicableItemsManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}