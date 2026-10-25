'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import ekinoksLogo from '../../../assets/logo/logo-symbol-color.svg';
import { NAVIGATION } from './navigation';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.aside}>
      <div className={styles.div}>
        <Image src={ekinoksLogo} alt="Villa Ekinoks" priority className={styles.image} />
      </div>

      <nav className={styles.nav}>
        {NAVIGATION.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Tooltip key={item.name} title={item.name} placement="right">
              <Link
                href={item.href}
                aria-label={item.name}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(styles.link, isActive && styles.linkActive)}
              >
                <item.icon className={styles.icon} />
              </Link>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
