'use client';

import React from 'react';
import { useCurrentUser } from '@/hooks/api';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className={`${styles.div} ${className}`}>
        <div className={styles.div2}></div>
        <div className={styles.div3}></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`${styles.div4} ${className}`}>
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
      <div className={styles.div5}>
        {fullName || 'User'}
      </div>
      <div className={styles.div6}>
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
    <div className={`${styles.div7} ${className}`}>
      {initials}
    </div>
  );
}

export default UserProfile;