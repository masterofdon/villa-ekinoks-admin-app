'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EditPropertyRentablePage } from '@/components/property-rentables';

export default function EditPropertyRentableRoute() {
  const params = useParams();
  const rentableId = params.id as string;

  return (
    <EditPropertyRentablePage rentableId={rentableId} />
  );
}