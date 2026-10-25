'use client';

import React from 'react';
import { useAuthState, useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UserAvatar } from '@/components/user/UserProfile';
import styles from './AuthStatusDisplay.module.css';

export function AuthStatusDisplay() {
  const { isAuthenticated, accessToken } = useAuthState();
  const { data: user, isLoading } = useCurrentUser();

  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className={styles.cardContent}>
        <div className={styles.div}>
          <div className={`${styles.div2} ${isAuthenticated ? styles.div3 : styles.div4}`}></div>
          <span className={styles.span}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>

        {isAuthenticated && (
          <>
            <div>
              <p className={styles.p}>Access Token</p>
              <p className={styles.p2}>
                {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}
              </p>
            </div>

            {isLoading ? (
              <div className={styles.div5}>Loading user data...</div>
            ) : user ? (
              <div className={styles.div6}>
                <UserAvatar className={styles.userAvatar} />
                <div>
                  <p className={styles.span}>
                    {[user.personalinfo.firstname, user.personalinfo.lastname]
                      .filter(Boolean)
                      .join(' ') || 'User'}
                  </p>
                  <p className={styles.div5}>{user.personalinfo.email}</p>
                  <p className={styles.p3}>ID: {user.id}</p>
                </div>
              </div>
            ) : (
              <div className={styles.div7}>User data not available</div>
            )}
          </>
        )}

        <div className={styles.p3}>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
          <p>Timestamp: {new Date().toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AuthStatusDisplay;