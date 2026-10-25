import React from 'react';
import styles from './StatusPage.module.css';

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  reference?: string;
  // Fills the viewport when rendered outside the app shell
  fullScreen?: boolean;
  children?: React.ReactNode;
}

export const statusPrimaryActionClass =
  styles.statusPrimaryAction;

export const statusSecondaryActionClass =
  styles.statusSecondaryAction;

// Plain markup only (no antd, hooks or next/link) so it also works inside global-error
export default function StatusPage({ code, title, description, reference, fullScreen = false, children }: StatusPageProps) {
  return (
    <div
      className={`${styles.div} ${fullScreen ? styles.div2 : styles.div3}`}
    >
      <div className={styles.div4}>
        <p className={styles.p}>{code}</p>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.p2}>{description}</p>
        {reference && <p className={styles.p3}>Reference: {reference}</p>}
        {children && <div className={styles.div5}>{children}</div>}
      </div>
    </div>
  );
}
