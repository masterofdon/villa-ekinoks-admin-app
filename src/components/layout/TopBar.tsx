'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Bell, ChevronDown, LogOut, MessageSquare, Settings } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/api';
import styles from './TopBar.module.css';

const iconButtonClass =
  styles.iconButton;

const TopBar: React.FC = () => {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const fullName = user
    ? [user.personalinfo.firstname, user.personalinfo.middlename, user.personalinfo.lastname]
        .filter(Boolean)
        .join(' ')
    : '';
  const displayName = fullName || user?.username || 'User';
  const initials = user
    ? `${user.personalinfo.firstname?.[0] || ''}${user.personalinfo.lastname?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';
  // The user model has no picture field yet; pick it up if the API starts returning one.
  const pictureUrl = (user as { profilepicture?: { url?: string } } | undefined)?.profilepicture?.url;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <Settings className={styles.settings} />,
      label: 'Profile & Settings',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className={styles.settings} />,
      label: logoutMutation.isPending ? 'Signing out...' : 'Sign out',
      disabled: logoutMutation.isPending,
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.header}>
      <button type="button" className={iconButtonClass} aria-label="Messaging" title="Messaging">
        <MessageSquare className={styles.messageSquare} />
      </button>
      <button type="button" className={`${iconButtonClass} ${styles.button}`} aria-label="Notifications" title="Notifications">
        <Bell className={styles.messageSquare} />
      </button>

      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <button
          type="button"
          className={styles.button2}
        >
          <Avatar src={pictureUrl} size={36} style={{ backgroundColor: '#596829' }}>
            {initials}
          </Avatar>
          <span className={styles.span}>{displayName}</span>
          <ChevronDown className={styles.chevronDown} />
        </button>
      </Dropdown>
    </header>
  );
};

export default TopBar;
