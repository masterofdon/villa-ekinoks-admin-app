'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Home, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function VillasPage() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.div}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <Home className={styles.home} />
          <CardTitle className={styles.cardTitle}>
            Villa Management Moved
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <p className={styles.p}>
            Villa management has been integrated into the dashboard. You can now view and manage your villa details directly from the main dashboard.
          </p>
          <Button onClick={handleGoToDashboard} className={styles.button}>
            <ArrowLeft className={styles.arrowLeft} />
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
