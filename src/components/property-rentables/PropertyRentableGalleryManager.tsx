'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  useDeletePropertyRentableGalleryImage,
  useReorderPropertyRentableGalleryImages,
  useUploadPropertyRentableGalleryImages,
} from '@/hooks/api';
import { PropertyRentable } from '@/types';
import { AuthImage } from '@/components/ui/AuthImage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { AlertCircle, GripVertical, ImageIcon, Images, Loader2, Save, Trash2, Upload, X } from 'lucide-react';
import styles from './PropertyRentableGalleryManager.module.css';

interface PropertyRentableGalleryManagerProps {
  rentable: PropertyRentable;
}

export const PropertyRentableGalleryManager: React.FC<PropertyRentableGalleryManagerProps> = ({
  rentable,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPropertyRentableGalleryImages();
  const deleteMutation = useDeletePropertyRentableGalleryImage();
  const reorderMutation = useReorderPropertyRentableGalleryImages();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingOrderIds, setPendingOrderIds] = useState<string[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const gallery = rentable.gallery;
  const serverOrderedImages = useMemo(
    () => gallery?.images
      ? [...gallery.images].sort(
          (first, second) =>
            (first.order ?? Number.MAX_SAFE_INTEGER) -
            (second.order ?? Number.MAX_SAFE_INTEGER)
        )
      : [],
    [gallery]
  );
  const images = useMemo(() => {
    if (!pendingOrderIds) return serverOrderedImages;

    const imageById = new Map(serverOrderedImages.map((galleryImage) => [galleryImage.id, galleryImage]));
    const pendingImages = pendingOrderIds
      .map((id) => imageById.get(id))
      .filter((galleryImage): galleryImage is (typeof serverOrderedImages)[number] => Boolean(galleryImage));
    const pendingIdSet = new Set(pendingOrderIds);
    return [
      ...pendingImages,
      ...serverOrderedImages.filter((galleryImage) => !pendingIdSet.has(galleryImage.id)),
    ];
  }, [pendingOrderIds, serverOrderedImages]);
  const hasOrderChanged = pendingOrderIds !== null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length !== files.length) {
      setErrorMessage('Only image files can be uploaded.');
    } else {
      setErrorMessage('');
    }

    setSelectedFiles((current) => {
      const knownFiles = new Set(
        current.map((file) => `${file.name}:${file.size}:${file.lastModified}`)
      );
      return [
        ...current,
        ...imageFiles.filter(
          (file) => !knownFiles.has(`${file.name}:${file.size}:${file.lastModified}`)
        ),
      ];
    });
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (!gallery || selectedFiles.length === 0) return;

    setErrorMessage('');
    try {
      await uploadMutation.mutateAsync({
        rentableId: rentable.id,
        galleryId: gallery.id,
        files: selectedFiles,
      });
      setSelectedFiles([]);
    } catch {
      setErrorMessage('Failed to upload the selected images. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!gallery || !deleteImageId) return;

    setErrorMessage('');
    try {
      await deleteMutation.mutateAsync({
        rentableId: rentable.id,
        galleryId: gallery.id,
        imageId: deleteImageId,
      });
      setPendingOrderIds((currentOrderIds) =>
        currentOrderIds?.filter((id) => id !== deleteImageId) ?? null
      );
      setDeleteImageId(null);
    } catch {
      setErrorMessage('Failed to remove the image. Please try again.');
    }
  };

  const handleDragStart = (event: React.DragEvent, imageId: string) => {
    setDraggingId(imageId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', imageId);
  };

  const handleDragOver = (event: React.DragEvent, imageId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (imageId !== draggingId) {
      setDragOverId(imageId);
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
      const serverOrderIds = serverOrderedImages.map((galleryImage) => galleryImage.id);
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

  const handleSaveOrder = async () => {
    if (!gallery) return;

    setErrorMessage('');
    try {
      await reorderMutation.mutateAsync({
        rentableId: rentable.id,
        galleryId: gallery.id,
        data: {
          idordermap: Object.fromEntries(
            images.map((galleryImage, index) => [galleryImage.id, index])
          ),
        },
      });
      setPendingOrderIds(null);
    } catch {
      setErrorMessage('Failed to save the image order. Please try again.');
    }
  };

  return (
    <>
      <section id="gallery" className={styles.section}>
        <Card>
          <CardHeader>
          <div className={styles.div}>
            <div>
              <CardTitle className={styles.cardTitle}>
                <Images className={styles.images} />
                Gallery images
              </CardTitle>
              <p className={styles.p}>
                {images.length} image{images.length === 1 ? '' : 's'} in this rentable gallery
              </p>
            </div>
            <div className={styles.cardTitle}>
              {hasOrderChanged && (
                <Button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={reorderMutation.isPending}
                  className={styles.button}
                >
                  {reorderMutation.isPending ? (
                    <Loader2 className={styles.loader2} />
                  ) : (
                    <Save className={styles.save} />
                  )}
                  {reorderMutation.isPending ? 'Saving...' : 'Save image order'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!gallery || uploadMutation.isPending || deleteMutation.isPending || hasOrderChanged}
                className={styles.cardTitle}
              >
                <Upload className={styles.save} />
                Select images
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className={styles.input}
            />
          </div>
          </CardHeader>
          <CardContent className={styles.cardContent}>
          {errorMessage && (
            <div className={styles.div2}>
              <AlertCircle className={styles.alertCircle} />
              {errorMessage}
            </div>
          )}

          {!gallery && (
            <div className={styles.div3}>
              This rentable does not have a gallery yet. Refresh the page and try again.
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className={styles.div4}>
              <div className={styles.div5}>
                <p className={styles.p2}>
                  {selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} ready to upload
                </p>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || !gallery}
                  className={styles.cardTitle}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className={styles.loader2} />
                  ) : (
                    <Upload className={styles.save} />
                  )}
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload images'}
                </Button>
              </div>
              <div className={styles.div6}>
                {selectedFiles.map((file) => (
                  <div
                    key={`${file.name}:${file.size}:${file.lastModified}`}
                    className={styles.div7}
                  >
                    <ImageIcon className={styles.imageIcon} />
                    <span className={styles.span}>{file.name}</span>
                    <span className={styles.span2}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((current) => current.filter((item) => item !== file))}
                      disabled={uploadMutation.isPending}
                      className={styles.button2}
                      aria-label={`Remove ${file.name} from upload`}
                      title={`Remove ${file.name}`}
                    >
                      <X className={styles.save} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 ? (
            <div className={styles.div8}>
              <ImageIcon className={styles.imageIcon2} />
              <p className={styles.p3}>No gallery images yet</p>
            </div>
          ) : (
            <div className={styles.div9}>
              {images.map((galleryImage, index) => {
                const imageUrl =
                  galleryImage.image.md?.url ??
                  galleryImage.image.lg?.url ??
                  galleryImage.image.sm?.url;

                return (
                  <div
                    key={galleryImage.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, galleryImage.id)}
                    onDragOver={(event) => handleDragOver(event, galleryImage.id)}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(event) => handleDrop(event, galleryImage.id)}
                    onDragEnd={handleDragEnd}
                    className={`${styles.div10} ${styles.group} ${
                      draggingId === galleryImage.id
                        ? styles.div11
                        : dragOverId === galleryImage.id
                          ? styles.div12
                          : styles.div13
                    }`}
                  >
                    {imageUrl ? (
                      <AuthImage
                        url={imageUrl}
                        alt={galleryImage.image.alt || `${rentable.name} gallery image ${index + 1}`}
                        className={styles.authImage}
                      />
                    ) : (
                      <div className={styles.div14}>
                        <ImageIcon className={styles.imageIcon3} />
                      </div>
                    )}
                    {index === 0 && (
                      <span className={styles.span3}>
                        Cover
                      </span>
                    )}
                    <div
                      className={styles.div15}
                      title="Drag to reorder"
                    >
                      <GripVertical className={styles.gripVertical} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteImageId(galleryImage.id)}
                      disabled={deleteMutation.isPending || uploadMutation.isPending}
                      className={styles.button3}
                      aria-label={`Remove image ${index + 1}`}
                      title="Remove image"
                    >
                      <Trash2 className={styles.save} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          </CardContent>
        </Card>
      </section>

      {deleteImageId && (
        <div className={styles.div16}>
          <dialog
            open
            aria-labelledby="delete-rentable-image-title"
            className={styles.dialog}
          >
            <h2 id="delete-rentable-image-title" className={styles.h2}>
              Remove gallery image?
            </h2>
            <p className={styles.p4}>
              This permanently removes the image and its resized files.
            </p>
            <div className={styles.div17}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteImageId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className={styles.button4}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className={styles.loader2} />
                ) : (
                  <Trash2 className={styles.save} />
                )}
                {deleteMutation.isPending ? 'Removing...' : 'Remove image'}
              </Button>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
};