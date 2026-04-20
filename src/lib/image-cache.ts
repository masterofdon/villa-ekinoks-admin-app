import { authApi } from './services';

// Cache configuration
export interface ImageCacheConfig {
  maxMemoryEntries: number;
  maxIndexedDBEntries: number;
  maxMemorySizeMB: number;
  maxIndexedDBSizeMB: number;
  defaultTtl: number; // Time to live in milliseconds
}

export interface CachedImage {
  url: string;
  blobUrl: string;
  blob: Blob;
  etag?: string;
  lastModified?: string;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheEntry {
  url: string;
  etag?: string;
  lastModified?: string;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  blob: Blob;
}

// Default configuration
const DEFAULT_CONFIG: ImageCacheConfig = {
  maxMemoryEntries: 100,
  maxIndexedDBEntries: 500,
  maxMemorySizeMB: 50,
  maxIndexedDBSizeMB: 200,
  defaultTtl: 24 * 60 * 60 * 1000, // 24 hours
};

class ImageCacheService {
  private memoryCache = new Map<string, CachedImage>();
  private config: ImageCacheConfig;
  private dbName = 'villa-admin-image-cache';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(config: Partial<ImageCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initIndexedDB();
  }

  private async initIndexedDB(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.warn('Failed to open IndexedDB for image cache:', request.error);
        resolve(); // Continue without IndexedDB
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('lastAccessed', 'lastAccessed');
          store.createIndex('size', 'size');
        }
      };
    });

    return this.initPromise;
  }

  private async cleanupMemoryCache(): Promise<void> {
    const entries = Array.from(this.memoryCache.entries());
    
    // Check size limit
    const totalSize = entries.reduce((sum, [, entry]) => sum + entry.size, 0);
    const maxSizeBytes = this.config.maxMemorySizeMB * 1024 * 1024;
    
    if (entries.length > this.config.maxMemoryEntries || totalSize > maxSizeBytes) {
      // Sort by LRU (least recently used first)
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      let currentSize = totalSize;
      let currentCount = entries.length;
      
      for (const [url, entry] of entries) {
        if (currentCount <= this.config.maxMemoryEntries && currentSize <= maxSizeBytes) {
          break;
        }
        
        // Revoke blob URL to prevent memory leaks
        URL.revokeObjectURL(entry.blobUrl);
        this.memoryCache.delete(url);
        currentSize -= entry.size;
        currentCount--;
      }
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Get all entries sorted by lastAccessed
      const request = store.index('lastAccessed').openCursor();
      const entries: CacheEntry[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          entries.push(cursor.value);
          cursor.continue();
        } else {
          // Check if cleanup is needed
          const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
          const maxSizeBytes = this.config.maxIndexedDBSizeMB * 1024 * 1024;
          
          if (entries.length > this.config.maxIndexedDBEntries || totalSize > maxSizeBytes) {
            let currentSize = totalSize;
            let currentCount = entries.length;
            
            for (const entry of entries) {
              if (currentCount <= this.config.maxIndexedDBEntries && currentSize <= maxSizeBytes) {
                break;
              }
              
              store.delete(entry.url);
              currentSize -= entry.size;
              currentCount--;
            }
          }
          resolve();
        }
      };
      
      request.onerror = () => {
        console.warn('Failed to cleanup IndexedDB:', request.error);
        resolve();
      };
    });
  }

  private async storeInIndexedDB(entry: CacheEntry): Promise<void> {
    await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn('Failed to store image in IndexedDB:', request.error);
        resolve();
      };
    });
  }

  private async getFromIndexedDB(url: string): Promise<CacheEntry | null> {
    await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(url);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && this.isEntryValid(entry)) {
          // Update access time
          entry.lastAccessed = Date.now();
          entry.accessCount++;
          this.storeInIndexedDB(entry);
          resolve(entry);
        } else if (entry) {
          // Entry exists but is invalid, remove it
          store.delete(url);
          resolve(null);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.warn('Failed to get image from IndexedDB:', request.error);
        resolve(null);
      };
    });
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < this.config.defaultTtl;
  }

  private async fetchWithAuth(url: string): Promise<{ response: Response; etag?: string; lastModified?: string }> {
    const token = authApi.getAccessToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const etag = response.headers.get('etag') || undefined;
    const lastModified = response.headers.get('last-modified') || undefined;

    return { response, etag, lastModified };
  }

  private async validateCacheWithServer(url: string, cachedEntry: CacheEntry): Promise<boolean> {
    try {
      const token = authApi.getAccessToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // Add conditional headers for cache validation
      if (cachedEntry.etag) {
        headers['If-None-Match'] = cachedEntry.etag;
      }
      if (cachedEntry.lastModified) {
        headers['If-Modified-Since'] = cachedEntry.lastModified;
      }

      const response = await fetch(url, { 
        method: 'HEAD', // Use HEAD to avoid downloading the full image
        headers 
      });

      // 304 Not Modified means cache is still valid
      return response.status === 304;
    } catch (error) {
      console.warn('Cache validation failed, treating as invalid:', error);
      return false;
    }
  }

  async getImage(url: string): Promise<string | null> {
    try {
      // Check memory cache first (fastest)
      let cachedImage = this.memoryCache.get(url);
      
      if (cachedImage) {
        // Update access statistics
        cachedImage.lastAccessed = Date.now();
        cachedImage.accessCount++;
        
        // Validate cache if ETag is available
        if (cachedImage.etag || cachedImage.lastModified) {
          const isValid = await this.validateCacheWithServer(url, {
            url: cachedImage.url,
            etag: cachedImage.etag,
            lastModified: cachedImage.lastModified,
            timestamp: cachedImage.timestamp,
            size: cachedImage.size,
            accessCount: cachedImage.accessCount,
            lastAccessed: cachedImage.lastAccessed,
            blob: cachedImage.blob,
          });
          
          if (!isValid) {
            // Cache is invalid, remove it and fetch new
            URL.revokeObjectURL(cachedImage.blobUrl);
            this.memoryCache.delete(url);
            cachedImage = undefined;
          }
        }
        
        if (cachedImage) {
          return cachedImage.blobUrl;
        }
      }

      // Check IndexedDB cache (persistent but slower)
      const indexedDBEntry = await this.getFromIndexedDB(url);
      
      if (indexedDBEntry) {
        // Validate cache if ETag is available
        if (indexedDBEntry.etag || indexedDBEntry.lastModified) {
          const isValid = await this.validateCacheWithServer(url, indexedDBEntry);
          
          if (!isValid) {
            // Cache is invalid, fetch new
            return this.fetchAndCache(url);
          }
        }
        
        // Move to memory cache for faster access
        const blobUrl = URL.createObjectURL(indexedDBEntry.blob);
        const memoryCacheEntry: CachedImage = {
          url: indexedDBEntry.url,
          blobUrl,
          blob: indexedDBEntry.blob,
          etag: indexedDBEntry.etag,
          lastModified: indexedDBEntry.lastModified,
          timestamp: indexedDBEntry.timestamp,
          size: indexedDBEntry.size,
          accessCount: indexedDBEntry.accessCount,
          lastAccessed: Date.now(),
        };
        
        this.memoryCache.set(url, memoryCacheEntry);
        await this.cleanupMemoryCache();
        
        return blobUrl;
      }

      // Not in cache, fetch and cache
      return this.fetchAndCache(url);

    } catch (error) {
      console.error('Image cache error:', error);
      return null;
    }
  }

  private async fetchAndCache(url: string): Promise<string> {
    const { response, etag, lastModified } = await this.fetchWithAuth(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const now = Date.now();
    
    const cacheEntry: CachedImage = {
      url,
      blobUrl,
      blob,
      etag,
      lastModified,
      timestamp: now,
      size: blob.size,
      accessCount: 1,
      lastAccessed: now,
    };

    // Store in memory cache
    this.memoryCache.set(url, cacheEntry);
    await this.cleanupMemoryCache();

    // Store in IndexedDB
    const indexedDBEntry: CacheEntry = {
      url,
      etag,
      lastModified,
      timestamp: now,
      size: blob.size,
      accessCount: 1,
      lastAccessed: now,
      blob,
    };
    
    await this.storeInIndexedDB(indexedDBEntry);
    await this.cleanupIndexedDB();

    return blobUrl;
  }

  async preloadImages(urls: string[]): Promise<void> {
    // Preload images in parallel with limited concurrency
    const concurrency = 3;
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(async (url) => {
        try {
          await this.getImage(url);
        } catch (error) {
          console.warn(`Failed to preload image: ${url}`, error);
        }
      });
      
      promises.push(...batchPromises);
      
      // Wait for current batch before starting next
      if (promises.length >= concurrency) {
        await Promise.allSettled(promises.splice(0, concurrency));
      }
    }
    
    // Wait for remaining promises
    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  async clearCache(): Promise<void> {
    // Clear memory cache
    Array.from(this.memoryCache.values()).forEach(entry => {
      URL.revokeObjectURL(entry.blobUrl);
    });
    this.memoryCache.clear();

    // Clear IndexedDB
    await this.initIndexedDB();
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('Failed to clear IndexedDB cache:', request.error);
          resolve();
        };
      });
    }
  }

  async getCacheStats(): Promise<{
    memoryEntries: number;
    memorySizeMB: number;
    indexedDBEntries: number;
    indexedDBSizeMB: number;
  }> {
    const memoryEntries = this.memoryCache.size;
    const memorySizeMB = Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0) / (1024 * 1024);

    let indexedDBEntries = 0;
    let indexedDBSizeMB = 0;

    await this.initIndexedDB();
    if (this.db) {
      await new Promise<void>((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            indexedDBEntries++;
            indexedDBSizeMB += cursor.value.size;
            cursor.continue();
          } else {
            indexedDBSizeMB /= (1024 * 1024);
            resolve();
          }
        };
        
        request.onerror = () => resolve();
      });
    }

    return {
      memoryEntries,
      memorySizeMB: Math.round(memorySizeMB * 100) / 100,
      indexedDBEntries,
      indexedDBSizeMB: Math.round(indexedDBSizeMB * 100) / 100,
    };
  }
}

// Singleton instance
export const imageCacheService = new ImageCacheService();

// Export the service for direct access and testing
export { ImageCacheService };