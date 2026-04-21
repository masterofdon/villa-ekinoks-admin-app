'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ParityRatesManagementPage } from '@/components/parity-rates';

export default function ParityRatesPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <ParityRatesManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}