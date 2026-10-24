'use client';

import Link from 'next/link';
import StatusPage, { statusPrimaryActionClass, statusSecondaryActionClass } from '@/components/layout/StatusPage';

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function RootError({ error, retry }: ErrorPageProps) {
  return (
    <StatusPage
      fullScreen
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or return to the home page."
      reference={error.digest}
    >
      <button type="button" onClick={() => retry()} className={statusPrimaryActionClass}>
        Try again
      </button>
      <Link href="/" className={statusSecondaryActionClass}>
        Go to home
      </Link>
    </StatusPage>
  );
}
