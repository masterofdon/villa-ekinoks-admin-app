'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from 'antd';
import type { BreadcrumbProps } from 'antd';
import { Home } from 'lucide-react';
import { useBreadcrumbExtra } from './BreadcrumbContext';
import { NAVIGATION } from './navigation';
import styles from './PageBreadcrumb.module.css';

const HOME_ROUTE = '/dashboard';
const ACTION_SEGMENTS = new Set(['create', 'edit']);

function humanize(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Route-driven breadcrumb rendered above the page content. The sidebar
 * `NAVIGATION` supplies the label/icon of the current section; a dynamic
 * segment (e.g. an id) shows the label set via `usePageBreadcrumbLabel`.
 */
const PageBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  const extraLabel = useBreadcrumbExtra();

  if (pathname === HOME_ROUTE) return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const navItem = NAVIGATION.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const rest = navItem ? segments.slice(navItem.href.split('/').filter(Boolean).length) : segments.slice(1);
  const sectionLabel = navItem ? navItem.name : humanize(segments[0]);
  const hasChildren = rest.length > 0;

  const sectionContent = (
    <>
      {navItem && <navItem.icon />}
      {sectionLabel}
    </>
  );

  const items: NonNullable<BreadcrumbProps['items']> = [
    {
      key: 'home',
      title: (
        <Link href={HOME_ROUTE} className={styles.link}>
          <Home /> Home
        </Link>
      ),
    },
    {
      key: 'section',
      title:
        hasChildren && navItem ? (
          <Link href={navItem.href} className={styles.link}>
            {sectionContent}
          </Link>
        ) : (
          <span className={styles.current}>{sectionContent}</span>
        ),
    },
  ];

  rest.forEach((segment, index) => {
    const isLast = index === rest.length - 1;
    const label = ACTION_SEGMENTS.has(segment) ? humanize(segment) : (extraLabel ?? 'Details');
    items.push({
      key: `${segment}-${index}`,
      title: <span className={isLast ? styles.current : styles.text}>{label}</span>,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className={styles.bar}>
      <Breadcrumb items={items} />
    </nav>
  );
};

export default PageBreadcrumb;
