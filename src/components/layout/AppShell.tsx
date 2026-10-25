import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import { BreadcrumbProvider } from '@/components/layout/BreadcrumbContext';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
}

// Persistent chrome for authenticated routes; only `children` changes per page
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.div}>
      <Sidebar />
      <div className={styles.div2}>
        <BreadcrumbProvider>
          <TopBar />
          <PageBreadcrumb />
          <main className={styles.main}>{children}</main>
        </BreadcrumbProvider>
      </div>
    </div>
  );
}
