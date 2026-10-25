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
import styles from './PropertyRentablesManagementPage.module.css';

const FeatureBadge: React.FC<{ feature: PropertyRentableFeature }> = ({ feature }) => (
  <div className={styles.div}>
    {feature.icon && (
      <span className={styles.span}>{feature.icon}</span>
    )}
    <span className={styles.span2}>{feature.name}</span>
    {feature.value && (
      <span className={styles.span3}>: {feature.value}</span>
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
      className={`${styles.li} ${
        isDragging ? styles.li2 : ''
      } ${
        isDragOver ? styles.li3 : ''
      }`}
    >
    <Card className={styles.card}>
      {/* Gallery cover image */}
      <div className={styles.div2}>
        {coverImage ? (
          <Image
            src={coverImage.image.md?.url ?? coverImage.image.lg?.url ?? coverImage.image.sm?.url}
            alt={coverImage.image.alt || rentable.name}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.div3}>
            <ImageIcon className={styles.imageIcon} />
          </div>
        )}
        {sortedImages.length > 1 && (
          <span className={styles.span4}>
            +{sortedImages.length - 1} photos
          </span>
        )}
        <div
          className={styles.div4}
          title="Drag to reorder"
        >
          <GripVertical className={styles.gripVertical} />
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className={styles.button}
          aria-label={`Delete ${rentable.name}`}
          title={`Delete ${rentable.name}`}
        >
          <Trash2 className={styles.trash2} />
        </button>
      </div>

      <CardContent className={styles.cardContent}>
        <div className={styles.div5}>
          <div className={styles.div6}>
            <Building2 className={styles.building2} />
          </div>
          <div className={styles.div7}>
            <h3 className={styles.h3}>
              {rentable.name}
            </h3>
            {rentable.gallery?.name && (
              <p className={styles.p}>{rentable.gallery.name}</p>
            )}
          </div>
          <div className={styles.div8}>
            <button
              type="button"
              onClick={onManageGallery}
              className={styles.button2}
              aria-label={`Manage gallery for ${rentable.name}`}
              title={`Manage gallery for ${rentable.name}`}
            >
              <Images className={styles.trash2} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className={styles.button2}
              aria-label={`Edit ${rentable.name}`}
              title={`Edit ${rentable.name}`}
            >
              <Pencil className={styles.trash2} />
            </button>
          </div>
        </div>

        {rentable.description && (
          <p className={styles.p2}>{rentable.description}</p>
        )}

        <div className={styles.div9}>
          <span className={styles.span5}>
            <ListOrdered className={styles.listOrdered} />
            Order: {displayOrder}
          </span>
          <span className={styles.span5}>
            <Users className={styles.listOrdered} />
            Capacity: {rentable.capacity ?? 'Not set'}
          </span>
        </div>

        {rentable.features && rentable.features.length > 0 && (
          <div>
            <div className={styles.div10}>
              <Star className={styles.listOrdered} />
              Features
            </div>
            <div className={styles.div11}>
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
    <div className={styles.div12}>
      <div className={styles.div13}>
        <div>
          <h1 className={styles.h1}>Property Rentables</h1>
          <p className={styles.p3}>
            Manage rentable units available at your villa.
          </p>
        </div>
        <div className={styles.div14}>
          {hasOrderChanged && (
            <Button
              onClick={handleSaveOrder}
              disabled={reorderMutation.isPending}
              className={styles.button3}
            >
              <Save className={styles.trash2} />
              {reorderMutation.isPending ? 'Saving...' : 'Save order'}
            </Button>
          )}
          <Button onClick={() => router.push('/property-rentables/create')} className={styles.button4}>
            <Plus className={styles.trash2} />
            Add Rentable
          </Button>
        </div>
      </div>

      {reorderMutation.isError && (
        <div className={styles.div15}>
          Failed to save the rentable order. Please try again.
        </div>
      )}

      {deleteMutation.isError && (
        <div className={styles.div15}>
          Failed to delete the property rentable. Please try again.
        </div>
      )}

      {isLoading && (
        <div className={styles.div16}>
          <Loader2 className={styles.loader2} />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className={styles.cardContent2}>
            <AlertCircle className={styles.alertCircle} />
            <p className={styles.span}>
              Failed to load property rentables.{' '}
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orderedRentables.length === 0 && (
        <Card>
          <CardContent className={styles.cardContent3}>
            <Building2 className={styles.building22} />
            <p className={styles.p4}>No rentables found</p>
            <p className={styles.span}>There are no rentable units configured for this villa yet.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && orderedRentables.length > 0 && (
        <>
          <div className={styles.div17}>
            {orderedRentables.length} rentable{orderedRentables.length !== 1 ? 's' : ''} available
          </div>
          <ol className={styles.ol}>
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
        <div className={styles.div18}>
          <div className={styles.div19}>
            <div className={styles.div20}>
              <AlertTriangle className={styles.alertTriangle} />
              <div>
                <h3 className={styles.h32}>Delete Property Rentable</h3>
                <p className={styles.p5}>
                  Are you sure you want to delete &ldquo;{rentableToDelete.name}&rdquo;? Its gallery,
                  images, and features will also be deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className={styles.div21}>
              <Button
                onClick={() => setRentableToDelete(null)}
                disabled={deleteMutation.isPending}
                className={styles.button5}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className={styles.button6}
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
