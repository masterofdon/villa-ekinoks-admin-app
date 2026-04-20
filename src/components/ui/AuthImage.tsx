'use client';

import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { imageCacheApi } from '@/lib/services';

interface AuthImageProps {
  url: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export const AuthImage: React.FC<AuthImageProps> = ({
  url,
  alt,
  className,
  fallback = <ImageIcon className="h-12 w-12 text-gray-300" />,
  onLoad,
  onError,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    setIsLoading(true);
    setHasError(false);
    setImageUrl(null);

    const loadImage = async () => {
      try {
        const cachedUrl = await imageCacheApi.getCachedImageUrl(url);
        
        if (!cancelled) {
          if (cachedUrl) {
            setImageUrl(cachedUrl);
            setIsLoading(false);
            onLoad?.();
          } else {
            // Cache service returned null, treat as error
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }
        }
      } catch (error) {
        console.error('Failed to load cached image:', error);
        if (!cancelled) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [url, onLoad, onError]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded h-12 w-12" />
        </div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => {
        setHasError(true);
        onError?.();
      }}
    />
  );
};
