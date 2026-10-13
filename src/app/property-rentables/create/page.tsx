import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CreatePropertyRentablePage } from '@/components/property-rentables';

export default function CreatePropertyRentableRoute() {
  return (
    <AuthGuard>
      <Sidebar>
        <CreatePropertyRentablePage />
      </Sidebar>
    </AuthGuard>
  );
}