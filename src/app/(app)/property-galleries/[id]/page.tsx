'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PropertyGalleryDetailPage } from '@/components/property-galleries';

export default function PropertyGalleryDetailRoute() {
  const params = useParams();
  const galleryId = params.id as string;

  return (
    <PropertyGalleryDetailPage galleryId={galleryId} />
  );
}
