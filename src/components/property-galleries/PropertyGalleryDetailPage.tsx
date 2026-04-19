'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyGalleries, useUploadGalleryImages, useDeleteGalleryImage } from '@/hooks/api';
import { PropertyImage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AuthImage } from '@/components/ui/AuthImage';
import {
  AlertTriangle,
  ArrowLeft,
  ImageIcon,
  Trash2,
  Upload,
  X,
  Images,
} from 'lucide-react';

interface PropertyGalleryDetailPageProps {
  galleryId: string;
}

interface PendingFile {
  file: File;
  preview: string;
  description: string;
}

const ImageCard: React.FC<{
  image: PropertyImage;
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
}> = ({ image, onDelete, isDeleting }) => {
  return (
    <div className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <AuthImage
          url={image.file.url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 truncate">{image.name}</p>
        {image.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{image.description}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(image.id)}
        disabled={isDeleting}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
        title="Delete image"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const PropertyGalleryDetailPage: React.FC<PropertyGalleryDetailPageProps> = ({
  galleryId,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch all galleries and find this one by ID
  const { data: galleriesData, isLoading, error, refetch } = usePropertyGalleries();
  const uploadMutation = useUploadGalleryImages();
  const deleteMutation = useDeleteGalleryImage();

  const gallery = galleriesData?.galleries?.find((g) => g.id === galleryId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPending: PendingFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: '',
    }));
    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateDescription = (index: number, description: string) => {
    setPendingFiles((prev) =>
      prev.map((p, i) => (i === index ? { ...p, description } : p))
    );
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploadError(null);

    try {
      await uploadMutation.mutateAsync({
        galleryId,
        files: pendingFiles.map((p) => p.file),
        descriptions: pendingFiles.map((p) => p.description),
      });
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPendingFiles([]);
      refetch();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteMutation.mutateAsync({ galleryId, imageId });
      refetch();
    } catch {
      // error handled via mutation state
    }
  };

  const fileSuffix = pendingFiles.length === 1 ? '' : 's';
  const uploadButtonLabel = uploadMutation.isPending
    ? 'Uploading...'
    : `Upload ${pendingFiles.length} File${fileSuffix}`;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gallery Not Found</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'Could not load gallery'}
              </p>
              <Button onClick={() => router.push('/property-galleries')}>
                Back to Galleries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/property-galleries')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Galleries
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Images className="h-7 w-7 text-blue-600" />
          {gallery.name}
        </h1>
        {gallery.description && (
          <p className="text-gray-600 mt-1">{gallery.description}</p>
        )}
      </div>

      {/* Existing Images */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Images ({gallery.images?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!gallery.images || gallery.images.length === 0 ? (
            <div className="text-center py-10">
              <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No images in this gallery yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.images.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload New Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upload Photos</CardTitle>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {pendingFiles.length === 0 ? (
            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-200 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 transition-colors bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Click to select images or drag &amp; drop
              </p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingFiles.map((pf, index) => (
                  <div
                    key={pf.file.name + pf.file.lastModified}
                    className="flex gap-3 border border-gray-200 rounded-lg p-3 items-start"
                  >
                    <img
                      src={pf.preview}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">
                        {pf.file.name}
                      </p>
                      <Label htmlFor={`desc-${index}`} className="text-xs">
                        Description
                      </Label>
                      <Input
                        id={`desc-${index}`}
                        value={pf.description}
                        onChange={(e) => updateDescription(index, e.target.value)}
                        placeholder="Optional description"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removePending(index)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
                    setPendingFiles([]);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploadButtonLabel}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
