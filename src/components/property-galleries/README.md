# Property Galleries Components

This folder contains components for managing property galleries and image uploads with real-time progress tracking.

## Components

### PropertyGalleriesManagementPage
- Main page for viewing and managing all property galleries
- Supports drag & drop reordering of galleries
- Bulk operations (save reorder, delete galleries)

### PropertyGalleryDetailPage  
- Detailed view for a specific gallery
- **NEW**: Real-time upload progress tracking via Server-Sent Events (SSE)
- Multi-file upload with individual progress monitoring
- Image management (view, delete existing images)

### CreatePropertyGalleryModal
- Modal for creating new property galleries
- Form validation and error handling

### UploadProgressBox
- **ENHANCED**: Real-time progress display with backend integration
- Shows detailed upload stages (validating, preparing, uploading, etc.)
- Individual job progress tracking with SSE
- Error handling and retry capabilities

## New Features: SSE Upload Progress Tracking

The property gallery upload system now includes real-time progress tracking using Server-Sent Events (SSE):

### Key Improvements
- **Real-time Progress**: Live updates from backend during upload process
- **Detailed Stages**: Shows specific upload stages (validation, image processing, etc.)
- **Better UX**: Users see exactly what's happening during uploads
- **Error Handling**: Detailed error messages and graceful fallbacks

### Technical Implementation
- SSE connection to `/api/v1/property-galleries/upload-progress/{uploadId}`
- Upload endpoint supports optional `uploadId` parameter
- Automatic connection cleanup and memory management
- Fallback to basic progress if SSE unavailable

### Progress Stages
1. **Started** (0%) - Upload initiated
2. **Validating** (5%) - Checking gallery exists  
3. **Preparing** (10%) - Preparing file for upload
4. **Uploading Original** (20%) - Uploading source image
5. **Creating Preview** (45%) - Generating 128x128 preview
6. **Creating Resized** (65%) - Generating 1024x1024 version
7. **Saving Records** (85%) - Creating database entries
8. **Finalizing** (95%) - Completing upload process
9. **Complete** (100%) - Upload finished successfully

## Usage

```tsx
import { PropertyGalleryDetailPage } from '@/components/property-galleries';

// Use in page component
<PropertyGalleryDetailPage galleryId={galleryId} />
```

## Dependencies

- React Query for data fetching
- Custom SSE service for progress tracking
- AuthImage component for secure image display
- Lucide React for icons

## Related Files

- `/lib/upload-progress-sse.ts` - SSE service implementation
- `/lib/services.ts` - API services (updated for uploadId support)  
- `/hooks/api.ts` - React Query hooks
- `/types/index.ts` - TypeScript definitions

See `/docs/UPLOAD_PROGRESS_TRACKING.md` for detailed technical documentation.