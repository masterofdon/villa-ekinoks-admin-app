import { useState, useCallback } from 'react';
import { useDeleteGalleryImage } from '@/hooks/api';

interface UseBulkDeleteOptions {
  galleryId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBulkDelete = ({ galleryId, onSuccess, onError }: UseBulkDeleteOptions) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const deleteMutation = useDeleteGalleryImage();

  const handleImageSelect = useCallback((imageId: string, selected: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(imageId);
      } else {
        newSet.delete(imageId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((allImageIds: string[]) => {
    setSelectedImages(new Set(allImageIds));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  const toggleBulkDeleteMode = useCallback(() => {
    setIsBulkDeleteMode(prev => {
      if (prev) {
        // Exiting bulk mode - clear selections
        setSelectedImages(new Set());
      }
      return !prev;
    });
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedImages.size === 0) return;

    setShowDeleteConfirmation(false);
    const imagesToDelete = Array.from(selectedImages);
    setDeletingImages(new Set(imagesToDelete));

    try {
      // Execute all deletions in parallel
      await Promise.all(
        imagesToDelete.map(imageId => 
          deleteMutation.mutateAsync({ galleryId, imageId })
        )
      );
      
      // Clear selections and exit bulk mode
      setSelectedImages(new Set());
      setIsBulkDeleteMode(false);
      onSuccess?.();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      onError?.(error);
    } finally {
      setDeletingImages(new Set());
    }
  }, [selectedImages, galleryId, deleteMutation, onSuccess, onError]);

  const showDeleteDialog = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const hideDeleteDialog = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  return {
    // State
    selectedImages,
    isBulkDeleteMode,
    deletingImages,
    showDeleteConfirmation,
    
    // Actions
    handleImageSelect,
    handleSelectAll,
    handleDeselectAll,
    toggleBulkDeleteMode,
    handleBulkDelete,
    showDeleteDialog,
    hideDeleteDialog,
    
    // Utils
    hasSelectedImages: selectedImages.size > 0,
    selectedCount: selectedImages.size,
    isDeleting: deletingImages.size > 0,
  };
};