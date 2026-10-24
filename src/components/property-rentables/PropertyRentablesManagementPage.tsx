'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useDeletePropertyRentable,
  usePropertyRentables,
  useReorderPropertyRentables,
} from '@/hooks/api';
import { PropertyRentable, PropertyRentableFeature } from '@/types';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Building2, GripVertical, ImageIcon, Images, Star, AlertCircle, AlertTriangle, ListOrdered, Loader2, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';

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
  displayOrder: number;
  onEdit: () => void;
  onManageGallery: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}> = ({
  rentable,
  displayOrder,
  onEdit,
  onManageGallery,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const sortedImages = rentable.gallery?.images
    ? [...rentable.gallery.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];
  const coverImage = sortedImages[0];

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`list-none transition-all ${
        isDragging ? 'scale-95 opacity-40' : ''
      } ${
        isDragOver ? 'rounded-lg ring-2 ring-blue-300' : ''
      }`}
    >
    <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
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
        <div
          className="absolute left-2 top-2 cursor-grab rounded bg-white/80 p-1 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 rounded bg-white/80 p-1 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${rentable.name}`}
          title={`Delete ${rentable.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
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

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ListOrdered className="h-3.5 w-3.5" />
            Order: {displayOrder}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Capacity: {rentable.capacity ?? 'Not set'}
          </span>
        </div>

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
    </li>
  );
};

export const PropertyRentablesManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: rentables, isLoading, isError, error } = usePropertyRentables();
  const reorderMutation = useReorderPropertyRentables();
  const deleteMutation = useDeletePropertyRentable();
  const [rentableToDelete, setRentableToDelete] = useState<PropertyRentable | null>(null);
  const [pendingOrderIds, setPendingOrderIds] = useState<string[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const serverOrderedRentables = useMemo(
    () => rentables
      ? [...rentables].sort(
          (first, second) =>
            (first.order ?? Number.MAX_SAFE_INTEGER) -
            (second.order ?? Number.MAX_SAFE_INTEGER)
        )
      : [],
    [rentables]
  );
  const orderedRentables = useMemo(() => {
    if (!pendingOrderIds) return serverOrderedRentables;

    const rentableById = new Map(
      serverOrderedRentables.map((rentable) => [rentable.id, rentable])
    );
    return pendingOrderIds
      .map((id) => rentableById.get(id))
      .filter((rentable): rentable is PropertyRentable => Boolean(rentable));
  }, [pendingOrderIds, serverOrderedRentables]);
  const hasOrderChanged = pendingOrderIds !== null;

  const handleDragStart = (event: React.DragEvent, id: string) => {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (event: React.DragEvent, id: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    setPendingOrderIds((currentOrderIds) => {
      const serverOrderIds = serverOrderedRentables.map((rentable) => rentable.id);
      const reorderedIds = [...(currentOrderIds ?? serverOrderIds)];
      const sourceIndex = reorderedIds.indexOf(sourceId);
      const targetIndex = reorderedIds.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return currentOrderIds;

      const [movedId] = reorderedIds.splice(sourceIndex, 1);
      reorderedIds.splice(targetIndex, 0, movedId);
      return reorderedIds.some((id, index) => id !== serverOrderIds[index])
        ? reorderedIds
        : null;
    });
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = () => {
    const idordermap = Object.fromEntries(
      orderedRentables.map((rentable, index) => [rentable.id, index])
    );
    reorderMutation.mutate(
      { idordermap },
      {
        onSuccess: () => {
          setPendingOrderIds(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!rentableToDelete) return;

    deleteMutation.mutate(rentableToDelete.id, {
      onSuccess: () => {
        setPendingOrderIds((currentOrderIds) =>
          currentOrderIds?.filter((id) => id !== rentableToDelete.id) ?? null
        );
        setRentableToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Rentables</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage rentable units available at your villa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasOrderChanged && (
            <Button
              onClick={handleSaveOrder}
              disabled={reorderMutation.isPending}
              className="flex items-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
            >
              <Save className="h-4 w-4" />
              {reorderMutation.isPending ? 'Saving...' : 'Save order'}
            </Button>
          )}
          <Button onClick={() => router.push('/property-rentables/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rentable
          </Button>
        </div>
      </div>

      {reorderMutation.isError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to save the rentable order. Please try again.
        </div>
      )}

      {deleteMutation.isError && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to delete the property rentable. Please try again.
        </div>
      )}

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

      {!isLoading && !isError && orderedRentables.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No rentables found</p>
            <p className="text-sm">There are no rentable units configured for this villa yet.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orderedRentables.length > 0 && (
        <>
          <div className="text-sm text-gray-500">
            {orderedRentables.length} rentable{orderedRentables.length !== 1 ? 's' : ''} available
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderedRentables.map((rentable, index) => (
              <RentableCard
                key={rentable.id}
                rentable={rentable}
                displayOrder={index}
                onEdit={() => router.push(`/property-rentables/${rentable.id}/edit`)}
                onManageGallery={() => router.push(`/property-rentables/${rentable.id}/edit#gallery`)}
                onDelete={() => setRentableToDelete(rentable)}
                isDragging={draggingId === rentable.id}
                isDragOver={dragOverId === rentable.id}
                onDragStart={(event) => handleDragStart(event, rentable.id)}
                onDragOver={(event) => handleDragOver(event, rentable.id)}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(event) => handleDrop(event, rentable.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </ol>
        </>
      )}

      {rentableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Property Rentable</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete &ldquo;{rentableToDelete.name}&rdquo;? Its gallery,
                  images, and features will also be deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setRentableToDelete(null)}
                disabled={deleteMutation.isPending}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
