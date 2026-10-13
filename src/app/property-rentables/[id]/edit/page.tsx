'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EditPropertyRentablePage } from '@/components/property-rentables';

export default function EditPropertyRentableRoute() {
  const params = useParams();
  const rentableId = params.id as string;

  return (
    <AuthGuard>
      <Sidebar>
        <EditPropertyRentablePage rentableId={rentableId} />
      </Sidebar>
    </AuthGuard>
  );
}