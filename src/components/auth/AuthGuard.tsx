'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/api';
import { ensureValidSession } from '@/lib/auth-session';
import styles from './AuthGuard.module.css';

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
    
    let cancelled = false;

    // Small delay to prevent hydration mismatches
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      // Skips the mirror call while the access token is valid; forces logout if renewal fails
      const valid = await ensureValidSession();
      if (!cancelled && valid) {
        setIsChecking(false);
      }
    };

    // Check authentication after component mounts
    const timer = setTimeout(checkAuth, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated, router]);

  // Show consistent loading state during SSR and initial client render
  if (!isClient || isChecking || !isAuthenticated) {
    return fallback || (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div className={styles.div3}></div>
          <div className={styles.div4}>Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthGuard;