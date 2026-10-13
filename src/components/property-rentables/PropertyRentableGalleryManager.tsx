'use client';

import React, { useRef, useState } from 'react';
import {
  useDeletePropertyRentableGalleryImage,
  useUploadPropertyRentableGalleryImages,
} from '@/hooks/api';
import { PropertyRentable } from '@/types';
import { AuthImage } from '@/components/ui/AuthImage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { AlertCircle, ImageIcon, Images, Loader2, Trash2, Upload, X } from 'lucide-react';

interface PropertyRentableGalleryManagerProps {
  rentable: PropertyRentable;
}

export const PropertyRentableGalleryManager: React.FC<PropertyRentableGalleryManagerProps> = ({
  rentable,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPropertyRentableGalleryImages();
  const deleteMutation = useDeletePropertyRentableGalleryImage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const gallery = rentable.gallery;
  const images = gallery?.images
    ? [...gallery.images].sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    : [];

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
      setDeleteImageId(null);
    } catch {
      setErrorMessage('Failed to remove the image. Please try again.');
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
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!gallery || uploadMutation.isPending || deleteMutation.isPending}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Select images
            </Button>
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
                    className="group relative aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-gray-100"
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