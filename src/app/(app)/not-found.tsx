import Link from 'next/link';
import StatusPage, { statusPrimaryActionClass } from '@/components/layout/StatusPage';

export const metadata = { title: 'Page not found | Villa Ekinoks Admin' };

// Rendered inside the app shell for signed-in users
export default function AppNotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved."
    >
      <Link href="/dashboard" className={statusPrimaryActionClass}>
        Back to dashboard
      </Link>
    </StatusPage>
  );
}
