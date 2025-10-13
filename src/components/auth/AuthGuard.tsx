'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/api';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return fallback || <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

export default AuthGuard;