'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, Calendar } from 'lucide-react';
import { useLogout } from '@/hooks/api';
import { UserProfile, UserAvatar } from '@/components/user/UserProfile';

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 px-4 bg-primary text-primary-foreground">
          <h1 className="text-xl font-bold">Villa Admin</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* User Profile Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <UserAvatar className="w-10 h-10 text-sm" />
            <UserProfile className="flex-1 min-w-0" />
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;