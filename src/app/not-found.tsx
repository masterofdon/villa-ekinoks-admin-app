import Link from 'next/link';
import StatusPage, { statusPrimaryActionClass } from '@/components/layout/StatusPage';

export const metadata = { title: 'Page not found | Villa Ekinoks Admin' };

export default function NotFound() {
  return (
    <StatusPage
      fullScreen
      code="404"
      title="Page not found"
      description="The page you are looking for doesn't exist or has been moved."
    >
      <Link href="/" className={statusPrimaryActionClass}>
        Go to home
      </Link>
    </StatusPage>
  );
}
