'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyGalleries, useUploadGalleryImages, useDeleteGalleryImage } from '@/hooks/api';
import { PropertyImage, UploadJob, UploadProgress, UploadJobStatus, UploadProgressEvent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AuthImage } from '@/components/ui/AuthImage';
import { UploadProgressBox } from './UploadProgressBox';
import { 
  createUploadProgressSSE, 
  generateUploadId, 
  getStageMessage,
  UploadProgressSSE 
} from '@/lib/upload-progress-sse';
import {
  AlertTriangle,
  ArrowLeft,
  ImageIcon,
  Trash2,
  Upload,
  X,
  Images,
  Check,
  Loader2,
} from 'lucide-react';

interface PropertyGalleryDetailPageProps {
  galleryId: string;
}

interface PendingFile {
  file: File;
  preview: string;
  description: string;
}

// Generate unique ID for upload jobs
const generateJobId = () => `job-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

// SSE connection manager
class UploadSSEManager {
  private readonly connections: Map<string, UploadProgressSSE> = new Map();

  createConnection(uploadId: string): UploadProgressSSE {
    if (this.connections.has(uploadId)) {
      return this.connections.get(uploadId)!;
    }
    
    const sse = createUploadProgressSSE(uploadId);
    this.connections.set(uploadId, sse);
    return sse;
  }

  cleanup(): void {
    this.connections.forEach(sse => sse.disconnect());
    this.connections.clear();
  }

  cleanupConnection(uploadId: string): void {
    const sse = this.connections.get(uploadId);
    if (sse) {
      sse.disconnect();
      this.connections.delete(uploadId);
    }
  }
}

const ImageCard: React.FC<{
  image: PropertyImage;
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
  isSelected?: boolean;
  onSelect?: (imageId: string, selected: boolean) => void;
  isBulkDeleteMode?: boolean;
  isIndividualDeleting?: boolean;
}> = ({ image, onDelete, isDeleting, isSelected = false, onSelect, isBulkDeleteMode = false, isIndividualDeleting = false }) => {
  const handleCardClick = () => {
    if (isBulkDeleteMode && onSelect) {
      onSelect(image.id, !isSelected);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(image.id, !isSelected);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(image.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isBulkDeleteMode && onSelect) {
      e.preventDefault();
      onSelect(image.id, !isSelected);
    }
  };

  const getAriaLabel = () => {
    if (!isBulkDeleteMode) return undefined;
    return `${isSelected ? 'Deselect' : 'Select'} ${image.name}`;
  };

  return (
    <button 
      type="button"
      className={`relative group border-2 rounded-lg overflow-hidden bg-white transition-all w-full ${
        isBulkDeleteMode ? 'cursor-pointer' : ''
      } ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${isBulkDeleteMode ? 'hover:border-blue-400' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      disabled={!isBulkDeleteMode}
      aria-label={getAriaLabel()}
    >
      {/* Loading overlay */}
      {isIndividualDeleting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      
      {/* Selection checkbox */}
      {isBulkDeleteMode && (
        <button
          onClick={handleSelectClick}
          className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white/80 border-gray-300 hover:border-blue-400'
          }`}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </button>
      )}
      
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <AuthImage
          url={image.resizedlargefile.url}
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
      
      {/* Individual delete button - hidden in bulk mode */}
      {!isBulkDeleteMode && (
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          title="Delete image"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </button>
  );
};

export const PropertyGalleryDetailPage: React.FC<PropertyGalleryDetailPageProps> = ({
  galleryId,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const sseManagerRef = useRef<UploadSSEManager>(new UploadSSEManager());

  // Fetch all galleries and find this one by ID
  const { data: galleriesData, isLoading, error, refetch } = usePropertyGalleries();
  const uploadMutation = useUploadGalleryImages();
  const deleteMutation = useDeleteGalleryImage();

  // Cleanup SSE connections on unmount
  useEffect(() => {
    const sseManager = sseManagerRef.current;
    return () => {
      sseManager.cleanup();
    };
  }, []);

  const gallery = galleriesData?.galleries?.find((g) => g.id === galleryId);

  // Calculate upload progress
  const uploadProgress: UploadProgress = React.useMemo(() => {
    const totalJobs = uploadJobs.length;
    const completedJobs = uploadJobs.filter(job => job.status === 'completed').length;
    const failedJobs = uploadJobs.filter(job => job.status === 'failed').length;
    const isAllCompleted = totalJobs > 0 && (completedJobs + failedJobs) === totalJobs;

    return {
      jobs: uploadJobs,
      totalJobs,
      completedJobs,
      failedJobs,
      isAllCompleted,
    };
  }, [uploadJobs]);

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

  // Create upload jobs from pending files
  const createUploadJobs = (files: PendingFile[]): UploadJob[] => {
    return files.map(file => ({
      id: generateJobId(),
      uploadId: generateUploadId(),
      file: file.file,
      description: file.description,
      status: 'pending' as UploadJobStatus,
      progress: 0,
    }));
  };

  // Update job status
  const updateJobStatus = useCallback((jobId: string, updates: Partial<UploadJob>) => {
    console.log(`updateJobStatus called for job ${jobId}:`, updates);
    
    setUploadJobs(prev => {
      const newJobs = prev.map(job => {
        if (job.id === jobId) {
          const updatedJob = { ...job, ...updates };
          console.log(`Job ${jobId} updated from:`, job, 'to:', updatedJob);
          return updatedJob;
        }
        return job;
      });
      console.log('All jobs after update:', newJobs);
      return newJobs;
    });
  }, []);

  // Handle SSE progress events
  const handleProgressEvent = useCallback((jobId: string) => 
    (event: UploadProgressEvent) => {
      console.log(`SSE progress event for job ${jobId}:`, event);
      
      const updates: Partial<UploadJob> = {
        progress: event.percentage || 0,
        stage: event.stage,
        stageMessage: event.message || getStageMessage(event.stage),
        ...(event.stage === 'complete' && { 
          status: 'completed',
        }),
        ...(event.stage === 'error' && { 
          status: 'failed', 
          error: event.error || 'Upload failed' 
        })
      };
      
      console.log(`Updating job ${jobId} with:`, updates);
      updateJobStatus(jobId, updates);

      // Cleanup SSE connection when complete or failed
      if (event.stage === 'complete' || event.stage === 'error') {
        console.log(`Cleaning up SSE connection for job ${jobId} due to stage: ${event.stage}`);
        const job = uploadJobs.find(j => j.id === jobId);
        if (job?.uploadId) {
          sseManagerRef.current.cleanupConnection(job.uploadId);
        }
      }
    }, [updateJobStatus, uploadJobs]);

  // Upload single job with SSE progress tracking
  const uploadSingleJob = async (job: UploadJob) => {
    if (!job.uploadId) {
      updateJobStatus(job.id, { 
        status: 'failed', 
        error: 'Missing upload ID' 
      });
      return;
    }

    try {
      console.log(`Starting upload for job ${job.id} with uploadId ${job.uploadId}`);
      updateJobStatus(job.id, { status: 'uploading', progress: 0 });

      // Start upload and SSE connection in parallel
      console.log(`Initiating upload request for ${job.file.name} to gallery ${galleryId}`);
      const uploadPromise = uploadMutation.mutateAsync({
        galleryId,
        file: job.file,
        description: job.description,
        uploadId: job.uploadId,
      });

      // Connect to SSE for progress tracking (with slight delay to ensure upload starts first)
      const connectSSE = async () => {
        try {
          // Brief delay to let upload request reach backend first
          await new Promise(resolve => setTimeout(resolve, 50));
          
          console.log(`Connecting to SSE for uploadId ${job.uploadId}`);
          const sse = sseManagerRef.current.createConnection(job.uploadId!);
          sse.addListener(handleProgressEvent(job.id));
          await sse.connect();
          console.log(`SSE connected successfully for uploadId ${job.uploadId}`);
        } catch (sseError) {
          console.warn('SSE connection failed for job', job.id, ':', sseError);
          // Upload continues without real-time progress
        }
      };

      // Start SSE connection (don't await - let it run in parallel)
      connectSSE();

      // Wait for upload to complete
      console.log(`Waiting for upload to complete for ${job.file.name}`);
      const result = await uploadPromise;
      console.log(`Upload completed successfully for ${job.file.name}:`, result);

      // If SSE didn't provide completion status, mark as completed
      const currentJob = uploadJobs.find(j => j.id === job.id);
      if (currentJob?.status === 'uploading') {
        updateJobStatus(job.id, { 
          status: 'completed', 
          progress: 100, 
          result,
          stage: 'complete',
          stageMessage: 'Upload complete!'
        });
      }

    } catch (error) {
      console.error(`Upload failed for ${job.file.name}:`, error);
      updateJobStatus(job.id, { 
        status: 'failed', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Upload failed',
        stage: 'error'
      });
      
      // Cleanup SSE connection on error
      if (job.uploadId) {
        sseManagerRef.current.cleanupConnection(job.uploadId);
      }
    }
  };

  // Start upload process
  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      console.log('No pending files to upload');
      return;
    }

    console.log(`Starting upload process for ${pendingFiles.length} files`);

    // Create jobs from pending files
    const newJobs = createUploadJobs(pendingFiles);
    console.log('Created upload jobs:', newJobs.map(job => ({ id: job.id, uploadId: job.uploadId, fileName: job.file.name })));
    
    setUploadJobs(newJobs);
    setShowProgress(true);

    // Clean up pending files
    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);

    // Start all uploads in parallel
    console.log('Starting all uploads in parallel...');
    const uploadPromises = newJobs.map(job => {
      console.log(`Queuing upload for job ${job.id} (${job.file.name})`);
      return uploadSingleJob(job);
    });
    
    // Wait for all to complete and refresh gallery
    Promise.allSettled(uploadPromises).then((results) => {
      console.log('All uploads completed:', results);
      refetch();
    });
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteMutation.mutateAsync({ galleryId, imageId });
      refetch();
    } catch {
      // error handled via mutation state
    }
  };

  const handleImageSelect = (imageId: string, selected: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(imageId);
      } else {
        newSet.delete(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!gallery?.images) return;
    
    const allImageIds = new Set(gallery.images.map(img => img.id));
    setSelectedImages(allImageIds);
  };

  const handleDeselectAll = () => {
    setSelectedImages(new Set());
  };

  const toggleBulkDeleteMode = () => {
    setIsBulkDeleteMode(prev => {
      if (prev) {
        // Exiting bulk mode - clear selections
        setSelectedImages(new Set());
      }
      return !prev;
    });
  };

  const handleBulkDelete = async () => {
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
      refetch();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setDeletingImages(new Set());
    }
  };

  const handleCloseProgress = () => {
    if (uploadProgress.isAllCompleted) {
      setShowProgress(false);
      setUploadJobs([]);
      // Cleanup all SSE connections
      sseManagerRef.current.cleanup();
    }
  };

  const fileSuffix = pendingFiles.length === 1 ? '' : 's';
  const isUploading = uploadJobs.some(job => job.status === 'uploading' || job.status === 'pending');

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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gallery Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'The gallery you are looking for does not exist.'}
              </p>
              <Button onClick={() => router.push('/property-galleries')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
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
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              Images ({gallery.images?.length ?? 0})
              {isBulkDeleteMode && selectedImages.size > 0 && (
                <Button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 h-8"
                  disabled={deletingImages.size > 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected ({selectedImages.size})
                </Button>
              )}
            </CardTitle>
            {gallery.images && gallery.images.length > 0 && (
              <div className="flex items-center gap-2">
                {isBulkDeleteMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectedImages.size === gallery.images.length ? handleDeselectAll : handleSelectAll}
                      className="text-xs"
                    >
                      {selectedImages.size === gallery.images.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleBulkDeleteMode}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleBulkDeleteMode}
                    className="text-xs"
                  >
                    Select Multiple
                  </Button>
                )}
              </div>
            )}
          </div>
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
                  isDeleting={deleteMutation.isPending && !isBulkDeleteMode}
                  isSelected={selectedImages.has(image.id)}
                  onSelect={handleImageSelect}
                  isBulkDeleteMode={isBulkDeleteMode}
                  isIndividualDeleting={deletingImages.has(image.id)}
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
              disabled={isUploading}
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
              disabled={isUploading}
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
                        Description (Optional)
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

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
                    setPendingFiles([]);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                  disabled={isUploading}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUploading ? 'Processing...' : `Upload ${pendingFiles.length} File${fileSuffix}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress Box */}
      {showProgress && (
        <UploadProgressBox 
          progress={uploadProgress} 
          onClose={handleCloseProgress} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Bulk Delete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete {selectedImages.size} selected image{selectedImages.size === 1 ? '' : 's'}? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={deletingImages.size > 0}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={deletingImages.size > 0}
                >
                  {deletingImages.size > 0 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {selectedImages.size} Image{selectedImages.size === 1 ? '' : 's'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};