import { useState, useEffect, useCallback } from 'react';
import { imageCacheApi } from '@/lib/services';

export interface UseImageCacheOptions {
  enabled?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface UseImageCacheReturn {
  imageUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
}

export function useImageCache(
  url: string | null | undefined,
  options: UseImageCacheOptions = {}
): UseImageCacheReturn {
  const { enabled = true, onLoad, onError } = options;
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadImage = useCallback(async (imageUrl: string) => {
    setIsLoading(true);
    setHasError(false);
    setImageUrl(null);

    try {
      const cachedUrl = await imageCacheApi.getCachedImageUrl(imageUrl);
      
      if (cachedUrl) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        onLoad?.();
      } else {
        throw new Error('Failed to load image from cache');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      console.error('Failed to load cached image:', errorObj);
      setHasError(true);
      setIsLoading(false);
      onError?.(errorObj);
    }
  }, [onLoad, onError]);

  const retry = useCallback(() => {
    if (url) {
      loadImage(url);
    }
  }, [url, loadImage]);

  useEffect(() => {
    if (!enabled || !url) {
      setImageUrl(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    loadImage(url);
  }, [url, enabled, loadImage]);

  return {
    imageUrl,
    isLoading,
    hasError,
    retry,
  };
}

export interface UseImagePreloadOptions {
  enabled?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface UseImagePreloadReturn {
  isPreloading: boolean;
  hasError: boolean;
  preload: (urls: string[]) => Promise<void>;
}

export function useImagePreload(
  options: UseImagePreloadOptions = {}
): UseImagePreloadReturn {
  const { enabled = true, onComplete, onError } = options;
  
  const [isPreloading, setIsPreloading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const preload = useCallback(async (urls: string[]) => {
    if (!enabled || urls.length === 0) return;

    setIsPreloading(true);
    setHasError(false);

    try {
      await imageCacheApi.preloadImages(urls);
      setIsPreloading(false);
      onComplete?.();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Preload failed');
      console.error('Failed to preload images:', errorObj);
      setHasError(true);
      setIsPreloading(false);
      onError?.(errorObj);
    }
  }, [enabled, onComplete, onError]);

  return {
    isPreloading,
    hasError,
    preload,
  };
}

// Hook for cache statistics monitoring
export interface UseCacheStatsReturn {
  stats: {
    memoryEntries: number;
    memorySizeMB: number;
    indexedDBEntries: number;
    indexedDBSizeMB: number;
  } | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useCacheStats(): UseCacheStatsReturn {
  const [stats, setStats] = useState<UseCacheStatsReturn['stats']>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const cacheStats = await imageCacheApi.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    isLoading,
    refresh,
  };
}