# Image Upload Progress Tracking

This document describes the real-time upload progress tracking implementation for Property Gallery image uploads using Server-Sent Events (SSE).

## Overview

The upload progress tracking system provides real-time feedback to users during image uploads by connecting to the backend's SSE endpoint. This replaces the previous simulated progress approach with actual backend-reported progress stages.

## Backend Integration

### SSE Endpoint
- **Endpoint**: `GET /api/v1/property-galleries/upload-progress/{uploadId}`
- **Type**: Server-Sent Events (text/event-stream)
- **Authentication**: Bearer token in `Authorization` header (standard approach)
- **Implementation**: Uses fetch with streaming instead of EventSource for header support
- **Purpose**: Provides real-time upload progress updates

### Upload Endpoint  
- **Endpoint**: `POST /api/v1/property-galleries/{id}/images`
- **New Parameter**: `uploadId` (optional) - Enables SSE progress tracking
- **Content-Type**: `multipart/form-data`

## Progress Stages

The backend reports progress through the following stages:

| Stage | Progress % | Description |
|-------|------------|-------------|
| `started` | 0% | Upload initiated |
| `validating` | 5% | Validating gallery exists |
| `preparing` | 10% | Preparing file for processing |
| `uploading-original` | 20% | Uploading original image |
| `uploading-preview` | 45% | Creating 128x128 preview |
| `uploading-resized` | 65% | Creating 1024x1024 resized image |
| `creating-records` | 85% | Saving to database |
| `finalizing` | 95% | Finalizing upload process |
| `complete` | 100% | Upload completed successfully |
| `error` | - | Upload failed with error |

## Technical Implementation

### Core Components

#### 1. Upload Progress SSE Service (`/lib/upload-progress-sse.ts`)

```typescript
import { createUploadProgressSSE, generateUploadId } from '@/lib/upload-progress-sse';

// Create SSE connection for upload tracking
const uploadId = generateUploadId();
const sse = createUploadProgressSSE(uploadId);

// Listen to progress events
sse.addListener((event) => {
  console.log(`Stage: ${event.stage}, Progress: ${event.progress}%`);
});

// Connect to SSE stream (uses fetch with streaming for proper auth headers)
await sse.connect();
```

**Implementation Details:**
- Uses `fetch()` with `ReadableStream` instead of `EventSource` for Authorization header support
- Proper Bearer token authentication in headers
- Automatic reconnection handling and error recovery
- Stream processing with SSE message parsing

#### 2. Updated Upload API

The upload service now accepts an optional `uploadId` parameter:

```typescript
import { propertyGalleriesApi } from '@/lib/services';

const result = await propertyGalleriesApi.uploadGalleryImages(
  galleryId,
  file,
  description,
  uploadId  // Optional: enables SSE tracking
);
```

#### 3. Enhanced Progress UI

The `UploadProgressBox` component now shows:
- Real-time stage messages (e.g., "Creating preview image...")
- Accurate progress percentages from backend
- Detailed error information when uploads fail

### Usage Example

```typescript
const handleUpload = async () => {
  const uploadId = generateUploadId();
  const sse = createUploadProgressSSE(uploadId);
  
  // Setup progress listener
  sse.addListener((event) => {
    setProgress(event.progress);
    setStageMessage(event.message || getStageMessage(event.stage));
    
    if (event.stage === 'complete') {
      onUploadComplete();
    } else if (event.stage === 'error') {
      onUploadError(event.error);
    }
  });
  
  // Connect and start upload
  await sse.connect();
  await uploadFile(file, uploadId);
};
```

## Type Definitions

### New Types Added

```typescript
export type UploadProgressStage = 
  | 'started' | 'validating' | 'preparing'
  | 'uploading-original' | 'uploading-preview' | 'uploading-resized'
  | 'creating-records' | 'finalizing' | 'complete' | 'error';

export type UploadProgressEvent = {
  stage: UploadProgressStage;
  progress: number;
  message?: string;
  error?: string;
};

export type UploadJob = {
  id: string;
  uploadId?: string;  // New: Backend upload ID for SSE
  file: File;
  description: string;
  status: UploadJobStatus;
  progress: number;
  stage?: UploadProgressStage;  // New: Current stage
  stageMessage?: string;        // New: Stage description
  error?: string;
  result?: Upload_PropertyGallery_Images_Response;
};
```

## Error Handling

The system includes robust error handling:

1. **SSE Connection Failures**: Upload continues even if SSE connection fails
2. **Upload Failures**: Proper error reporting through both SSE and upload API
3. **Connection Cleanup**: Automatic cleanup of SSE connections when complete
4. **Graceful Degradation**: Falls back to basic progress tracking if SSE unavailable

## Browser Compatibility

- **Modern Browsers**: Full SSE support with real-time progress
- **Older Browsers**: Graceful degradation to basic upload functionality
- **Mobile**: Fully supported on iOS Safari and Android Chrome

## Performance Considerations

- SSE connections are automatically cleaned up after completion
- Memory usage is minimal with efficient event listener management
- Progress updates are throttled to avoid UI flooding
- Connections timeout automatically after completion

## Development Notes

- The `uploadId` is generated client-side using `generateUploadId()`
- SSE connections are managed through the `UploadSSEManager` class
- Progress stages are mapped to user-friendly messages via `getStageMessage()`
- All SSE connections are cleaned up on component unmount

## Testing

To test the upload progress tracking:

1. Select multiple large images (>1MB each)
2. Start upload and observe real-time progress updates
3. Check browser Network tab for SSE connection
4. Verify progress stages appear in correct sequence
5. Confirm proper cleanup after completion