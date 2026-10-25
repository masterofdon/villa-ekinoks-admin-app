'use client';

import React, { useEffect } from 'react';
import { useImagePreload } from '@/hooks/useImageCache';
import styles from './ImageCacheUtils.module.css';

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
      <div className={`${styles.div} ${className}`}>
        <div className={styles.div2}>Loading cache stats...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className={`${styles.div} ${className}`}>
      {showTitle && <h3 className={styles.h3}>Image Cache Stats</h3>}
      <div className={styles.div3}>
        <div>Memory: {stats.memoryEntries} images ({stats.memorySizeMB} MB)</div>
        <div>Storage: {stats.indexedDBEntries} images ({stats.indexedDBSizeMB} MB)</div>
        <button
          onClick={refreshStats}
          className={styles.button}
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
      className={`${styles.button2} ${className}`}
    >
      {isClearing ? 'Clearing...' : children}
    </button>
  );
};