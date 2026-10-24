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
      <section id="gallery" className="scroll-mt-6">
        <Card>
          <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Images className="h-5 w-5 text-blue-600" />
                Gallery images
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                {images.length} image{images.length === 1 ? '' : 's'} in this rentable gallery
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasOrderChanged && (
                <Button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={reorderMutation.isPending}
                  className="flex items-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
                >
                  {reorderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {reorderMutation.isPending ? 'Saving...' : 'Save image order'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!gallery || uploadMutation.isPending || deleteMutation.isPending || hasOrderChanged}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Select images
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          </CardHeader>
          <CardContent className="space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {!gallery && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This rentable does not have a gallery yet. Refresh the page and try again.
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-blue-900">
                  {selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} ready to upload
                </p>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || !gallery}
                  className="flex items-center gap-2"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload images'}
                </Button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file) => (
                  <div
                    key={`${file.name}:${file.size}:${file.lastModified}`}
                    className="flex items-center gap-3 rounded border border-blue-100 bg-white px-3 py-2"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{file.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((current) => current.filter((item) => item !== file))}
                      disabled={uploadMutation.isPending}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                      aria-label={`Remove ${file.name} from upload`}
                      title={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-gray-300 py-12 text-gray-400">
              <ImageIcon className="mb-3 h-10 w-10" />
              <p className="text-sm font-medium">No gallery images yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    className={`group relative aspect-[4/3] overflow-hidden rounded-md border bg-gray-100 transition-all ${
                      draggingId === galleryImage.id
                        ? 'scale-95 border-gray-200 opacity-40'
                        : dragOverId === galleryImage.id
                          ? 'border-blue-400 ring-2 ring-blue-300'
                          : 'border-gray-200'
                    }`}
                  >
                    {imageUrl ? (
                      <AuthImage
                        url={imageUrl}
                        alt={galleryImage.image.alt || `${rentable.name} gallery image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-xs font-medium text-white">
                        Cover
                      </span>
                    )}
                    <div
                      className="absolute left-2 top-2 cursor-grab rounded bg-white/95 p-1 shadow-sm active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4 text-gray-500" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteImageId(galleryImage.id)}
                      disabled={deleteMutation.isPending || uploadMutation.isPending}
                      className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/95 text-red-600 shadow-sm transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                      aria-label={`Remove image ${index + 1}`}
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <dialog
            open
            aria-labelledby="delete-rentable-image-title"
            className="w-full max-w-md rounded-md bg-white p-6 shadow-xl"
          >
            <h2 id="delete-rentable-image-title" className="text-lg font-semibold text-gray-900">
              Remove gallery image?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This permanently removes the image and its resized files.
            </p>
            <div className="mt-6 flex justify-end gap-3">
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
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
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