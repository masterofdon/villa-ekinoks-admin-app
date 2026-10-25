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
import styles from './PropertyGalleryDetailPage.module.css';

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
      className={`${styles.button} ${styles.group} ${
        isBulkDeleteMode ? styles.button2 : ''
      } ${
        isSelected ? styles.button3 : styles.button4
      } ${isBulkDeleteMode ? styles.button5 : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      disabled={!isBulkDeleteMode}
      aria-label={getAriaLabel()}
    >
      {/* Loading overlay */}
      {isIndividualDeleting && (
        <div className={styles.div}>
          <Loader2 className={styles.loader2} />
        </div>
      )}
      
      {/* Selection checkbox */}
      {isBulkDeleteMode && (
        <button
          onClick={handleSelectClick}
          className={`${styles.button6} ${
            isSelected 
              ? styles.button7 
              : styles.button8
          }`}
        >
          {isSelected && <Check className={styles.check} />}
        </button>
      )}
      
      <div className={styles.div2}>
        <AuthImage
          url={image.resizedlargefile.url}
          alt={image.name}
          className={styles.authImage}
        />
      </div>
      <div className={styles.div3}>
        <p className={styles.p}>{image.name}</p>
        {image.description && (
          <p className={styles.p2}>{image.description}</p>
        )}
      </div>
      
      {/* Individual delete button - hidden in bulk mode */}
      {!isBulkDeleteMode && (
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={styles.button9}
          title="Delete image"
        >
          <Trash2 className={styles.trash2} />
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
      <div className={styles.div4}>
        <div className={styles.div5}>
          <div className={styles.div6}></div>
          <div className={styles.div7}></div>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className={styles.div4}>
        <Card>
          <CardContent className={styles.div4}>
            <div className={styles.div8}>
              <AlertTriangle className={styles.alertTriangle} />
              <h3 className={styles.h3}>
                Gallery Not Found
              </h3>
              <p className={styles.p3}>
                {error instanceof Error ? error.message : 'The gallery you are looking for does not exist.'}
              </p>
              <Button onClick={() => router.push('/property-galleries')}>
                <ArrowLeft className={styles.arrowLeft} />
                Back to Galleries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.div9}>
      {/* Header */}
      <div className={styles.div10}>
        <button
          onClick={() => router.push('/property-galleries')}
          className={styles.button10}
        >
          <ArrowLeft className={styles.arrowLeft2} />
          Back to Galleries
        </button>
        <h1 className={styles.h1}>
          <Images className={styles.images} />
          {gallery.name}
        </h1>
        {gallery.description && (
          <p className={styles.p4}>{gallery.description}</p>
        )}
      </div>

      {/* Existing Images */}
      <Card className={styles.div10}>
        <CardHeader>
          <div className={styles.div11}>
            <CardTitle className={styles.cardTitle}>
              Images ({gallery.images?.length ?? 0})
              {isBulkDeleteMode && selectedImages.size > 0 && (
                <Button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className={styles.button11}
                  disabled={deletingImages.size > 0}
                >
                  <Trash2 className={styles.trash22} />
                  Delete Selected ({selectedImages.size})
                </Button>
              )}
            </CardTitle>
            {gallery.images && gallery.images.length > 0 && (
              <div className={styles.div12}>
                {isBulkDeleteMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectedImages.size === gallery.images.length ? handleDeselectAll : handleSelectAll}
                      className={styles.button12}
                    >
                      {selectedImages.size === gallery.images.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleBulkDeleteMode}
                      className={styles.button12}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleBulkDeleteMode}
                    className={styles.button12}
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
            <div className={styles.div13}>
              <ImageIcon className={styles.imageIcon} />
              <p className={styles.p5}>No images in this gallery yet.</p>
            </div>
          ) : (
            <div className={styles.div14}>
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
          <div className={styles.div11}>
            <CardTitle>Upload Photos</CardTitle>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className={styles.button13}
              disabled={isUploading}
            >
              <Upload className={styles.arrowLeft} />
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
            className={styles.input}
            onChange={handleFileSelect}
          />

          {pendingFiles.length === 0 ? (
            <button
              type="button"
              className={styles.button14}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className={styles.upload} />
              <p className={styles.p6}>
                Click to select images or drag &amp; drop
              </p>
            </button>
          ) : (
            <div className={styles.div15}>
              <div className={styles.div16}>
                {pendingFiles.map((pf, index) => (
                  <div
                    key={pf.file.name + pf.file.lastModified}
                    className={styles.div17}
                  >
                    <img
                      src={pf.preview}
                      alt="preview"
                      className={styles.img}
                    />
                    <div className={styles.div18}>
                      <p className={styles.p7}>
                        {pf.file.name}
                      </p>
                      <Label htmlFor={`desc-${index}`} className={styles.button12}>
                        Description (Optional)
                      </Label>
                      <Input
                        id={`desc-${index}`}
                        value={pf.description}
                        onChange={(e) => updateDescription(index, e.target.value)}
                        placeholder="Optional description"
                        className={styles.input2}
                      />
                    </div>
                    <button
                      onClick={() => removePending(index)}
                      className={styles.button15}
                    >
                      <X className={styles.arrowLeft2} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.div19}>
                <Button
                  onClick={() => {
                    pendingFiles.forEach((p) => URL.revokeObjectURL(p.preview));
                    setPendingFiles([]);
                  }}
                  className={styles.button16}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={styles.button13}
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
        <div className={styles.div20}>
          <Card className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <CardTitle className={styles.cardTitle2}>
                <AlertTriangle className={styles.alertTriangle2} />
                Confirm Bulk Delete
              </CardTitle>
            </CardHeader>
            <CardContent className={styles.div15}>
              <p className={styles.p8}>
                Are you sure you want to delete {selectedImages.size} selected image{selectedImages.size === 1 ? '' : 's'}? 
                This action cannot be undone.
              </p>
              <div className={styles.div21}>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirmation(false)}
                  disabled={deletingImages.size > 0}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  className={styles.button17}
                  disabled={deletingImages.size > 0}
                >
                  {deletingImages.size > 0 ? (
                    <>
                      <Loader2 className={styles.loader22} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className={styles.arrowLeft} />
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