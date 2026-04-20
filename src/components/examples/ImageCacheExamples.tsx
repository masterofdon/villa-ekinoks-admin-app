'use client';

import React, { useEffect } from 'react';
import { 
  AuthImage, 
  ImagePreloader, 
  PropertyGalleryPreloader, 
  CacheStatsDisplay, 
  CacheClearButton 
} from '@/components/ui';
import { useImageCache, useImagePreload } from '@/hooks/useImageCache';

// Example 1: Basic usage with AuthImage (already updated)
const BasicImageExample: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Cached Images</h3>
      <div className="grid grid-cols-3 gap-4">
        <AuthImage
          url="https://example.com/image1.jpg"
          alt="Example 1"
          className="w-full h-32 object-cover rounded"
        />
        <AuthImage
          url="https://example.com/image2.jpg"
          alt="Example 2"
          className="w-full h-32 object-cover rounded"
        />
        <AuthImage
          url="https://example.com/image3.jpg"
          alt="Example 3"
          className="w-full h-32 object-cover rounded"
        />
      </div>
    </div>
  );
};

// Example 2: Using the useImageCache hook directly
const CustomImageComponent: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const { imageUrl, isLoading, hasError, retry } = useImageCache(url);

  if (isLoading) {
    return <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" />;
  }

  if (hasError) {
    return (
      <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center">
        <span className="text-xs text-gray-500 mb-2">Failed to load</span>
        <button onClick={retry} className="text-xs text-blue-500 hover:text-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return imageUrl ? (
    <img src={imageUrl} alt={alt} className="w-32 h-32 object-cover rounded" />
  ) : null;
};

// Example 3: Property gallery with preloading
const PropertyGalleryExample: React.FC<{ villaId?: string }> = ({ villaId }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Property Gallery with Preloading</h3>
      
      {/* Preload gallery images in background */}
      <PropertyGalleryPreloader
        villaId={villaId}
        onComplete={() => console.log('Gallery images preloaded')}
        onError={(error) => console.error('Preload error:', error)}
      >
        {({ isPreloading }) => (
          isPreloading && (
            <div className="text-sm text-blue-600 mb-2">
              📦 Preloading gallery images...
            </div>
          )
        )}
      </PropertyGalleryPreloader>

      {/* Your existing gallery component would go here */}
      <div className="text-gray-600">
        Gallery images will load much faster due to preloading!
      </div>
    </div>
  );
};

// Example 4: Manual preloading with useImagePreload hook
const ManualPreloadExample: React.FC = () => {
  const { isPreloading, preload } = useImagePreload({
    onComplete: () => console.log('Manual preload complete'),
  });

  const handlePreloadClick = () => {
    const urls = [
      'https://example.com/large-image1.jpg',
      'https://example.com/large-image2.jpg',
      'https://example.com/large-image3.jpg',
    ];
    preload(urls);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Manual Preloading</h3>
      <button
        onClick={handlePreloadClick}
        disabled={isPreloading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPreloading ? 'Preloading...' : 'Preload Images'}
      </button>
    </div>
  );
};

// Example 5: Cache management tools
const CacheManagementExample: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Cache Management</h3>
      
      {/* Display cache statistics */}
      <CacheStatsDisplay />
      
      {/* Clear cache button */}
      <CacheClearButton
        onClear={() => {
          console.log('Cache cleared');
          alert('Image cache has been cleared!');
        }}
        className="mt-2"
      />
    </div>
  );
};

// Example 6: Integration with existing property gallery page
const PropertyGalleryPageExample: React.FC<{ villaId: string }> = ({ villaId }) => {
  useEffect(() => {
    // Preload gallery images when component mounts
    import('@/lib/services').then(({ imageCacheApi }) => {
      imageCacheApi.preloadPropertyGalleryImages(villaId);
    });
  }, [villaId]);

  return (
    <div>
      {/* Your existing gallery components */}
      {/* Images will now be served from cache for much faster loading */}
    </div>
  );
};

// Complete usage example page
const ImageCacheExamplesPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Image Cache Service Examples</h1>
      
      <BasicImageExample />
      <PropertyGalleryExample villaId="example-villa-id" />
      <ManualPreloadExample />
      <CacheManagementExample />
      
      {/* Development tools - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Development Tools</h2>
          <CacheStatsDisplay showTitle={false} />
        </div>
      )}
    </div>
  );
};

export default ImageCacheExamplesPage;