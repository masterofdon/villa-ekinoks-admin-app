import Link from 'next/link';
import StatusPage, { statusPrimaryActionClass, statusSecondaryActionClass } from '@/components/layout/StatusPage';

export const metadata = { title: 'Service unavailable | Villa Ekinoks Admin' };

interface ServiceUnavailablePageProps {
  searchParams: Promise<{ from?: string | string[] }>;
}

// Only same-origin relative paths are accepted, to avoid open redirects
const safeRetryPath = (from: string | string[] | undefined): string => {
  const value = Array.isArray(from) ? from[0] : from;
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/503') ? value : '/';
};

export default async function ServiceUnavailablePage({ searchParams }: ServiceUnavailablePageProps) {
  const { from } = await searchParams;

  return (
    <StatusPage
      fullScreen
      code="503"
      title="Service unavailable"
      description="The service is temporarily unavailable, possibly due to maintenance. Please try again in a few moments."
    >
      <a href={safeRetryPath(from)} className={statusPrimaryActionClass}>
        Try again
      </a>
      <Link href="/" className={statusSecondaryActionClass}>
        Go to home
      </Link>
    </StatusPage>
  );
}
