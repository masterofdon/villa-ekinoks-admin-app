'use client';

import Link from 'next/link';
import StatusPage, { statusPrimaryActionClass, statusSecondaryActionClass } from '@/components/layout/StatusPage';

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Rendered inside the app shell for signed-in users
export default function AppError({ error, retry }: ErrorPageProps) {
  return (
    <StatusPage
      code="500"
      title="Something went wrong"
      description="An unexpected error occurred while loading this page. You can try again or return to the dashboard."
      reference={error.digest}
    >
      <button type="button" onClick={() => retry()} className={statusPrimaryActionClass}>
        Try again
      </button>
      <Link href="/dashboard" className={statusSecondaryActionClass}>
        Back to dashboard
      </Link>
    </StatusPage>
  );
}
