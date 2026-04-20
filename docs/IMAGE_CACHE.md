# Image Cache Service Documentation

## Overview

The Image Cache Service provides a two-tier caching system for authenticated images in your villa admin application. It prioritizes fast loading times with automatic cache invalidation based on ETag headers.

## Architecture

### Two-Tier Caching
- **Memory Cache**: Fast access for recently used images
- **IndexedDB**: Persistent storage across browser sessions

### Features
- ✅ ETag-based cache validation
- ✅ LRU (Least Recently Used) eviction policy
- ✅ Automatic size management
- ✅ Authentication header injection
- ✅ Background image preloading
- ✅ Fallback to direct fetch on errors
- ✅ TypeScript support

## Basic Usage

### 1. Using the Enhanced AuthImage Component

The existing `AuthImage` component has been updated to use the cache service automatically:

```tsx
import { AuthImage } from '@/components/ui';

<AuthImage
  url="https://api.villaekinoks.com/images/property.jpg"
  alt="Property image"
  className="w-full h-64 object-cover"
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>
```

### 2. Using the useImageCache Hook

For custom image components:

```tsx
import { useImageCache } from '@/hooks/useImageCache';

const MyCustomImage = ({ url, alt }) => {
  const { imageUrl, isLoading, hasError, retry } = useImageCache(url);

  if (isLoading) return <div>Loading...</div>;
  if (hasError) return <button onClick={retry}>Retry</button>;
  
  return <img src={imageUrl} alt={alt} />;
};
```

### 3. Direct API Usage

```tsx
import { imageCacheApi } from '@/lib/services';

// Get cached image URL
const cachedUrl = await imageCacheApi.getCachedImageUrl(imageUrl);

// Preload multiple images
await imageCacheApi.preloadImages([url1, url2, url3]);

// Clear cache
await imageCacheApi.clearImageCache();

// Get cache statistics
const stats = await imageCacheApi.getCacheStats();
```

## Advanced Usage

### Property Gallery Preloading

Automatically preload all images in a property gallery:

```tsx
import { PropertyGalleryPreloader } from '@/components/ui';

<PropertyGalleryPreloader
  villaId="villa-123"
  onComplete={() => console.log('Gallery preloaded')}
>
  {({ isPreloading }) => (
    isPreloading && <div>Preloading gallery...</div>
  )}
</PropertyGalleryPreloader>
```

### Manual Image Preloading

```tsx
import { useImagePreload } from '@/hooks/useImageCache';

const { preload, isPreloading } = useImagePreload({
  onComplete: () => console.log('Preload complete'),
});

// Preload images when component mounts
useEffect(() => {
  preload([
    'https://api.villaekinoks.com/image1.jpg',
    'https://api.villaekinoks.com/image2.jpg',
  ]);
}, []);
```

### Cache Management Components

```tsx
import { CacheStatsDisplay, CacheClearButton } from '@/components/ui';

// Display cache statistics
<CacheStatsDisplay />

// Cache clear button
<CacheClearButton 
  onClear={() => alert('Cache cleared!')}
/>
```

## Integration Examples

### Property Gallery Page

```tsx
const PropertyGalleryPage = ({ villaId }) => {
  useEffect(() => {
    // Preload gallery images on page load
    imageCacheApi.preloadPropertyGalleryImages(villaId);
  }, [villaId]);

  return (
    <div>
      {/* Your gallery components - images will load from cache */}
      {images.map(image => (
        <AuthImage key={image.id} url={image.url} alt={image.alt} />
      ))}
    </div>
  );
};
```

### Dashboard with Image Stats

```tsx
const Dashboard = () => {
  return (
    <div>
      {/* Your dashboard content */}
      
      {/* Show cache stats in development */}
      {process.env.NODE_ENV === 'development' && <CacheStatsDisplay />}
    </div>
  );
};
```

## Configuration

The cache service uses sensible defaults but can be configured:

```tsx
import { ImageCacheService } from '@/lib/image-cache';

const customCache = new ImageCacheService({
  maxMemoryEntries: 150,     // Default: 100
  maxIndexedDBEntries: 1000, // Default: 500
  maxMemorySizeMB: 100,      // Default: 50MB
  maxIndexedDBSizeMB: 500,   // Default: 200MB
  defaultTtl: 48 * 60 * 60 * 1000, // Default: 24 hours
});
```

## Cache Invalidation

The service automatically validates cache entries using HTTP ETag headers:

1. When requesting a cached image, the service sends a HEAD request with `If-None-Match` header
2. If server responds with `304 Not Modified`, cached version is used
3. If server responds with new content, cache is updated with fresh image

## Error Handling

The service includes comprehensive error handling:

- **Cache failures**: Falls back to direct fetch
- **Network errors**: Shows fallback content
- **IndexedDB errors**: Continues with memory-only caching
- **Authentication errors**: Handled by existing API interceptors

## Performance Optimization Tips

1. **Preload critical images**: Use `PropertyGalleryPreloader` or manual preloading for images that will be shown soon
2. **Monitor cache size**: Use `CacheStatsDisplay` in development to ensure cache isn't growing too large
3. **Clear cache periodically**: Provide users with `CacheClearButton` in settings
4. **Use appropriate image sizes**: Smaller images cache more efficiently

## Browser Support

- **Memory Cache**: All modern browsers
- **IndexedDB**: All modern browsers (IE10+)
- **Graceful degradation**: Falls back to direct fetch if IndexedDB unavailable

## Development Tools

### Cache Statistics

The `CacheStatsDisplay` component shows:
- Memory cache: entries and size
- IndexedDB cache: entries and size
- Real-time updates

### Cache Inspection

In browser DevTools:
1. **Application tab > IndexedDB** → `villa-admin-image-cache`
2. **Memory tab** → Look for blob URLs
3. **Network tab** → See cache hits (304 responses)

## Migration Notes

### From Old AuthImage

The new `AuthImage` component is a drop-in replacement with additional features:
- Added `onLoad` and `onError` callbacks
- Better loading states with spinner
- Automatic caching

### Existing Images

No migration needed - the cache service will start caching images as they're requested.

## Troubleshooting

### Images Not Caching
- Check browser DevTools → Network tab for 304 responses
- Verify ETag headers are present in API responses
- Check `CacheStatsDisplay` for cache growth

### Slow Initial Load
- Use preloading for critical images
- Check image sizes (consider optimizing large images)
- Verify authentication tokens are valid

### Cache Not Clearing
- Check IndexedDB in DevTools
- Try `imageCacheApi.clearImageCache()` programmatically
- Clear browser data as last resort

### Memory Issues
- Monitor cache sizes with `getCacheStats()`
- Adjust `maxMemorySizeMB` configuration
- Clear cache more frequently in low-memory environments