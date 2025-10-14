'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/api';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthState();
  const [isClient, setIsClient] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Mark that we're now on the client side
    setIsClient(true);
    
    // Small delay to prevent hydration mismatches
    const checkAuth = () => {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    };

    // Check authentication after component mounts
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Show consistent loading state during SSR and initial client render
  if (!isClient || isChecking || !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;