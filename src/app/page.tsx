'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/api';
import styles from './page.module.css';

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
    <div className={styles.div}>
      <div className={styles.div2}>Loading...</div>
    </div>
  );
}