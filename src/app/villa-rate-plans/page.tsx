import React from 'react';
import { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { VillaRatePlansManagementPage } from '@/components/villa-rate-plans';

export const metadata: Metadata = {
  title: 'Villa Rate Plans | Villa Admin',
  description: 'Manage villa rate plans and pricing adjustments',
};

export default function VillaRatePlansPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <VillaRatePlansManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}