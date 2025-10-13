'use client';

import React from 'react';
import { useAuthState, useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UserAvatar } from '@/components/user/UserProfile';

export function AuthStatusDisplay() {
  const { isAuthenticated, accessToken } = useAuthState();
  const { data: user, isLoading } = useCurrentUser();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>

        {isAuthenticated && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Access Token</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}
              </p>
            </div>

            {isLoading ? (
              <div className="text-sm text-gray-600">Loading user data...</div>
            ) : user ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <UserAvatar className="w-10 h-10 text-sm" />
                <div>
                  <p className="font-medium">
                    {[user.personalinfo.firstname, user.personalinfo.lastname]
                      .filter(Boolean)
                      .join(' ') || 'User'}
                  </p>
                  <p className="text-sm text-gray-600">{user.personalinfo.email}</p>
                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">User data not available</div>
            )}
          </>
        )}

        <div className="text-xs text-gray-500">
          <p>Current URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
          <p>Timestamp: {new Date().toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AuthStatusDisplay;