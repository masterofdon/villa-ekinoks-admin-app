'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/api';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Show a loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-lg">Loading...</div>
    </div>
  );
}