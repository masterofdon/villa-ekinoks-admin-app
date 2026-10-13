'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePropertyRentables } from '@/hooks/api';
import { PropertyRentable, PropertyRentableFeature } from '@/types';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Building2, ImageIcon, Images, Star, AlertCircle, Loader2, Pencil, Plus } from 'lucide-react';

const FeatureBadge: React.FC<{ feature: PropertyRentableFeature }> = ({ feature }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
    {feature.icon && (
      <span className="text-sm">{feature.icon}</span>
    )}
    <span className="font-medium">{feature.name}</span>
    {feature.value && (
      <span className="text-gray-500">: {feature.value}</span>
    )}
  </div>
);

const RentableCard: React.FC<{
  rentable: PropertyRentable;
  onEdit: () => void;
  onManageGallery: () => void;
}> = ({ rentable, onEdit, onManageGallery }) => {
  const sortedImages = rentable.gallery?.images
    ? [...rentable.gallery.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];
  const coverImage = sortedImages[0];

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      {/* Gallery cover image */}
      <div className="relative w-full h-48 bg-gray-100">
        {coverImage ? (
          <Image
            src={coverImage.image.md?.url ?? coverImage.image.lg?.url ?? coverImage.image.sm?.url}
            alt={coverImage.image.alt || rentable.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-10 w-10 text-gray-300" />
          </div>
        )}
        {sortedImages.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            +{sortedImages.length - 1} photos
          </span>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight truncate">
              {rentable.name}
            </h3>
            {rentable.gallery?.name && (
              <p className="text-xs text-gray-500 truncate">{rentable.gallery.name}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onManageGallery}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Manage gallery for ${rentable.name}`}
              title={`Manage gallery for ${rentable.name}`}
            >
              <Images className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
              aria-label={`Edit ${rentable.name}`}
              title={`Edit ${rentable.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        {rentable.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{rentable.description}</p>
        )}

        {rentable.features && rentable.features.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <Star className="h-3.5 w-3.5" />
              Features
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rentable.features.map((feature) => (
                <FeatureBadge key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PropertyRentablesManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: rentables, isLoading, isError, error } = usePropertyRentables();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Rentables</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage rentable units available at your villa.
          </p>
        </div>
        <Button onClick={() => router.push('/property-rentables/create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Rentable
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Failed to load property rentables.{' '}
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && rentables?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No rentables found</p>
            <p className="text-sm">There are no rentable units configured for this villa yet.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && rentables && rentables.length > 0 && (
        <>
          <div className="text-sm text-gray-500">
            {rentables.length} rentable{rentables.length !== 1 ? 's' : ''} available
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentables.map((rentable) => (
              <RentableCard
                key={rentable.id}
                rentable={rentable}
                onEdit={() => router.push(`/property-rentables/${rentable.id}/edit`)}
                onManageGallery={() => router.push(`/property-rentables/${rentable.id}/edit#gallery`)}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
};
