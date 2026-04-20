'use client';

import React, { useEffect } from 'react';
import { useImagePreload } from '@/hooks/useImageCache';

interface ImagePreloaderProps {
  urls: string[];
  enabled?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

/**
 * Component that preloads images in the background
 * Useful for preloading gallery images when entering a page
 */
export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  urls,
  enabled = true,
  onComplete,
  onError,
  children,
}) => {
  const { isPreloading, preload } = useImagePreload({
    enabled,
    onComplete,
    onError,
  });

  useEffect(() => {
    if (enabled && urls.length > 0) {
      preload(urls);
    }
  }, [urls, enabled, preload]);

  // Render children with preloading status
  if (children && typeof children === 'function') {
    return (children as any)({ isPreloading });
  }

  return <>{children}</>;
};

interface PropertyGalleryPreloaderProps {
  villaId?: string;
  enabled?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  children?: (status: { isPreloading: boolean }) => React.ReactNode;
}

/**
 * Specialized component for preloading property gallery images
 */
export const PropertyGalleryPreloader: React.FC<PropertyGalleryPreloaderProps> = ({
  villaId,
  enabled = true,
  onComplete,
  onError,
  children,
}) => {
  const { isPreloading } = useImagePreload({
    enabled,
    onComplete,
    onError,
  });

  useEffect(() => {
    if (enabled) {
      // Import here to avoid circular dependencies
      import('@/lib/services').then(({ imageCacheApi }) => {
        imageCacheApi.preloadPropertyGalleryImages(villaId);
      });
    }
  }, [villaId, enabled]);

  return (
    <>
      {children?.({ isPreloading })}
    </>
  );
};

interface CacheStatsDisplayProps {
  className?: string;
  showTitle?: boolean;
}

/**
 * Debug component to display cache statistics
 */
export const CacheStatsDisplay: React.FC<CacheStatsDisplayProps> = ({
  className = '',
  showTitle = true,
}) => {
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshStats = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { imageCacheApi } = await import('@/lib/services');
      const cacheStats = await imageCacheApi.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-100 rounded ${className}`}>
        <div className="animate-pulse">Loading cache stats...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={`p-4 bg-gray-100 rounded ${className}`}>
      {showTitle && <h3 className="font-semibold mb-2">Image Cache Stats</h3>}
      <div className="space-y-1 text-sm">
        <div>Memory: {stats.memoryEntries} images ({stats.memorySizeMB} MB)</div>
        <div>Storage: {stats.indexedDBEntries} images ({stats.indexedDBSizeMB} MB)</div>
        <button
          onClick={refreshStats}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

interface CacheClearButtonProps {
  onClear?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Button component to clear image cache
 */
export const CacheClearButton: React.FC<CacheClearButtonProps> = ({
  onClear,
  className = '',
  children = 'Clear Image Cache',
}) => {
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const { imageCacheApi } = await import('@/lib/services');
      await imageCacheApi.clearImageCache();
      onClear?.();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={isClearing}
      className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 ${className}`}
    >
      {isClearing ? 'Clearing...' : children}
    </button>
  );
};