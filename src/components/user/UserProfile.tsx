'use client';

import React from 'react';
import { useCurrentUser } from '@/hooks/api';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-32"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <span>Guest User</span>
      </div>
    );
  }

  const fullName = [
    user.personalinfo.firstname,
    user.personalinfo.middlename,
    user.personalinfo.lastname
  ].filter(Boolean).join(' ');

  return (
    <div className={`${className}`}>
      <div className="font-medium text-gray-900">
        {fullName || 'User'}
      </div>
      <div className="text-sm text-gray-500">
        {user.personalinfo.email}
      </div>
    </div>
  );
}

// Simple user avatar component
export function UserAvatar({ className = '' }: UserProfileProps) {
  const { data: user } = useCurrentUser();

  const initials = user 
    ? `${user.personalinfo.firstname?.[0] || ''}${user.personalinfo.lastname?.[0] || ''}`
    : 'U';

  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white font-medium ${className}`}>
      {initials}
    </div>
  );
}

export default UserProfile;