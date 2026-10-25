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
import styles from './ImageCacheExamples.module.css';

// Example 1: Basic usage with AuthImage (already updated)
const BasicImageExample: React.FC = () => {
  return (
    <div className={styles.div}>
      <h3 className={styles.h3}>Basic Cached Images</h3>
      <div className={styles.div2}>
        <AuthImage
          url="https://example.com/image1.jpg"
          alt="Example 1"
          className={styles.authImage}
        />
        <AuthImage
          url="https://example.com/image2.jpg"
          alt="Example 2"
          className={styles.authImage}
        />
        <AuthImage
          url="https://example.com/image3.jpg"
          alt="Example 3"
          className={styles.authImage}
        />
      </div>
    </div>
  );
};

// Example 2: Using the useImageCache hook directly
const CustomImageComponent: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const { imageUrl, isLoading, hasError, retry } = useImageCache(url);

  if (isLoading) {
    return <div className={styles.div3} />;
  }

  if (hasError) {
    return (
      <div className={styles.div4}>
        <span className={styles.span}>Failed to load</span>
        <button onClick={retry} className={styles.button}>
          Retry
        </button>
      </div>
    );
  }

  return imageUrl ? (
    <img src={imageUrl} alt={alt} className={styles.img} />
  ) : null;
};

// Example 3: Property gallery with preloading
const PropertyGalleryExample: React.FC<{ villaId?: string }> = ({ villaId }) => {
  return (
    <div className={styles.div}>
      <h3 className={styles.h3}>Property Gallery with Preloading</h3>
      
      {/* Preload gallery images in background */}
      <PropertyGalleryPreloader
        villaId={villaId}
        onComplete={() => console.log('Gallery images preloaded')}
        onError={(error) => console.error('Preload error:', error)}
      >
        {({ isPreloading }) => (
          isPreloading && (
            <div className={styles.div5}>
              📦 Preloading gallery images...
            </div>
          )
        )}
      </PropertyGalleryPreloader>

      {/* Your existing gallery component would go here */}
      <div className={styles.div6}>
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
    <div className={styles.div}>
      <h3 className={styles.h3}>Manual Preloading</h3>
      <button
        onClick={handlePreloadClick}
        disabled={isPreloading}
        className={styles.button2}
      >
        {isPreloading ? 'Preloading...' : 'Preload Images'}
      </button>
    </div>
  );
};

// Example 5: Cache management tools
const CacheManagementExample: React.FC = () => {
  return (
    <div className={styles.div}>
      <h3 className={styles.h3}>Cache Management</h3>
      
      {/* Display cache statistics */}
      <CacheStatsDisplay />
      
      {/* Clear cache button */}
      <CacheClearButton
        onClear={() => {
          console.log('Cache cleared');
          alert('Image cache has been cleared!');
        }}
        className={styles.cacheClearButton}
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
    <div className={styles.div7}>
      <h1 className={styles.h1}>Image Cache Service Examples</h1>
      
      <BasicImageExample />
      <PropertyGalleryExample villaId="example-villa-id" />
      <ManualPreloadExample />
      <CacheManagementExample />
      
      {/* Development tools - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.div8}>
          <h2 className={styles.h2}>Development Tools</h2>
          <CacheStatsDisplay showTitle={false} />
        </div>
      )}
    </div>
  );
};

export default ImageCacheExamplesPage;