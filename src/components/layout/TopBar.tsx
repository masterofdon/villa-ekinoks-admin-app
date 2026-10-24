'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { Bell, ChevronDown, LogOut, MessageSquare, Settings } from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/api';

const iconButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900';

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
      icon: <Settings className="h-4 w-4" />,
      label: 'Profile & Settings',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="h-4 w-4" />,
      label: logoutMutation.isPending ? 'Signing out...' : 'Sign out',
      disabled: logoutMutation.isPending,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-gray-200 bg-white px-6">
      <button type="button" className={iconButtonClass} aria-label="Messaging" title="Messaging">
        <MessageSquare className="h-5 w-5" />
      </button>
      <button type="button" className={`${iconButtonClass} mr-2`} aria-label="Notifications" title="Notifications">
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <button
          type="button"
          className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-gray-100"
        >
          <Avatar src={pictureUrl} size={36} style={{ backgroundColor: '#596829' }}>
            {initials}
          </Avatar>
          <span className="max-w-[160px] truncate text-sm font-medium text-gray-900">{displayName}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </Dropdown>
    </header>
  );
};

export default TopBar;
