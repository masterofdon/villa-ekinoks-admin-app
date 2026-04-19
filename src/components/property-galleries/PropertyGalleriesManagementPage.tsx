'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyGalleries, useReorderPropertyGalleries } from '@/hooks/api';
import { PropertyGallery } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Images, AlertTriangle, ChevronRight, ImageIcon, GripVertical, Save } from 'lucide-react';
import { CreatePropertyGalleryModal } from './CreatePropertyGalleryModal';
import { AuthImage } from '@/components/ui/AuthImage';

const GalleryCard: React.FC<{
  gallery: PropertyGallery;
  onClick: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}> = ({ gallery, onClick, isDragging, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) => {
  const coverImage = gallery.images?.[0]?.file?.url;

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`border rounded-lg overflow-hidden bg-white transition-all select-none
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isDragOver ? 'border-blue-400 shadow-lg ring-2 ring-blue-300' : 'border-gray-200 hover:shadow-md'}
      `}
    >
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {coverImage ? (
          <AuthImage
            url={coverImage}
            alt={gallery.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-gray-300" />
        )}
        <div className="absolute top-2 left-2 bg-white/80 rounded p-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="p-4 flex items-center justify-between w-full text-left group"
      >
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{gallery.name}</h3>
          <p className="text-sm text-gray-500 truncate mt-0.5">{gallery.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            {gallery.images?.length ?? 0} image{(gallery.images?.length ?? 0) === 1 ? '' : 's'}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2 group-hover:text-gray-600" />
      </button>
    </li>
  );
};

export const PropertyGalleriesManagementPage: React.FC = () => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderedGalleries, setOrderedGalleries] = useState<PropertyGallery[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const originalOrderRef = useRef<string[]>([]);

  const { data, isLoading, error, refetch } = usePropertyGalleries();
  const reorderMutation = useReorderPropertyGalleries();

  useEffect(() => {
    const galleries = data?.galleries ?? [];
    setOrderedGalleries(galleries);
    originalOrderRef.current = galleries.map((g) => g.id);
    setHasOrderChanged(false);
  }, [data]);

  const handleModalSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }

    setOrderedGalleries((prev) => {
      const updated = [...prev];
      const fromIndex = updated.findIndex((g) => g.id === sourceId);
      const toIndex = updated.findIndex((g) => g.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const newOrder = updated.map((g) => g.id);
      setHasOrderChanged(
        newOrder.some((id, i) => id !== originalOrderRef.current[i])
      );
      return updated;
    });

    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = () => {
    const idordermap: { [id: string]: number } = {};
    orderedGalleries.forEach((g, index) => {
      idordermap[g.id] = index;
    });

    reorderMutation.mutate(
      { idordermap },
      {
        onSuccess: () => {
          originalOrderRef.current = orderedGalleries.map((g) => g.id);
          setHasOrderChanged(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Galleries
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Images className="h-7 w-7 text-blue-600" />
          Property Galleries
        </h1>
        <p className="text-gray-600 mt-1">
          Manage photo galleries for your villa property
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Galleries</CardTitle>
              {hasOrderChanged && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={reorderMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-sm h-8 px-3"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {reorderMutation.isPending ? 'Saving...' : 'Save gallery order'}
                </Button>
              )}
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Gallery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orderedGalleries.length === 0 ? (
            <div className="text-center py-12">
              <Images className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Galleries Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first gallery to start showcasing your villa.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Gallery
              </Button>
            </div>
          ) : (
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
              {orderedGalleries.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onClick={() => router.push(`/property-galleries/${gallery.id}`)}
                  isDragging={draggingId === gallery.id}
                  isDragOver={dragOverId === gallery.id}
                  onDragStart={(e) => handleDragStart(e, gallery.id)}
                  onDragOver={(e) => handleDragOver(e, gallery.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, gallery.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <CreatePropertyGalleryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
