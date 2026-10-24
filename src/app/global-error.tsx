'use client';

import './globals.css';
import StatusPage, { statusPrimaryActionClass, statusSecondaryActionClass } from '@/components/layout/StatusPage';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Replaces the root layout when it fails, so it must render its own document.
// Plain anchors are used because the router may be unavailable here.
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
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
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={statusSecondaryActionClass}>
            Go to home
          </a>
        </StatusPage>
      </body>
    </html>
  );
}
