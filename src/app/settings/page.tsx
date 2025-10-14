'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, User, Bell, Lock, Palette } from 'lucide-react';
import type { VillaAdminUser } from '@/types';

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  const villaAdminUser = user as VillaAdminUser;

  return (
    <AuthGuard>
      <Sidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your account preferences and application settings.
            </p>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">First Name</label>
                    <p className="mt-1 text-gray-900">{user.personalinfo.firstname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Name</label>
                    <p className="mt-1 text-gray-900">{user.personalinfo.lastname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">{user.personalinfo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="mt-1 text-gray-900">{user.personalinfo.phonenumber || 'Not provided'}</p>
                  </div>
                </div>
              )}
              <div className="pt-4">
                <Button variant="outline" disabled>
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive booking updates via email</p>
                </div>
                <Button variant="outline" disabled>
                  Configure (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
                </div>
                <Button variant="outline" disabled>
                  Configure (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </div>
                <Button variant="outline" disabled>
                  Change (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="outline" disabled>
                  Enable (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
          {villaAdminUser?.villa && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Villa Management
                </CardTitle>
              </CardHeader>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Theme</h4>
                  <p className="text-sm text-gray-600">Customize the appearance of your dashboard</p>
                </div>
                <Button variant="outline" disabled>
                  Change Theme (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </AuthGuard>
  );
}