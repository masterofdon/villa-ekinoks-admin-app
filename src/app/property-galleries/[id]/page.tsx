'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { PropertyGalleryDetailPage } from '@/components/property-galleries';

export default function PropertyGalleryDetailRoute() {
  const params = useParams();
  const galleryId = params.id as string;

  return (
    <AuthGuard>
      <Sidebar>
        <PropertyGalleryDetailPage galleryId={galleryId} />
      </Sidebar>
    </AuthGuard>
  );
}
