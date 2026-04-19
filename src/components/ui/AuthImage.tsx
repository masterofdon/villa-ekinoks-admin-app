'use client';

import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface AuthImageProps {
  url: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const AuthImage: React.FC<AuthImageProps> = ({
  url,
  alt,
  className,
  fallback = <ImageIcon className="h-12 w-12 text-gray-300" />,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const token = globalThis.window === undefined ? null : localStorage.getItem('accesstoken');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (!blobUrl) return <>{fallback}</>;
  return <img src={blobUrl} alt={alt} className={className} />;
};
