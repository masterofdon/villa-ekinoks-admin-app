'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DiscountCodesManagementPage } from '@/components/discount-codes';

export default function DiscountCodesPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <DiscountCodesManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}