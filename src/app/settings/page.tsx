'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrentUser, useUpdatePersonalInfo } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Save } from 'lucide-react';
import type { VillaAdminUser, Update_VillaAdminUserPersonalInfo_WC_MLS_XAction } from '@/types';

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  const villaAdminUser = user as VillaAdminUser;
  const updatePersonalInfo = useUpdatePersonalInfo();

  const [formValues, setFormValues] = useState<Update_VillaAdminUserPersonalInfo_WC_MLS_XAction>({
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    phonenumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormValues({
        firstname: user.personalinfo.firstname ?? '',
        middlename: user.personalinfo.middlename ?? '',
        lastname: user.personalinfo.lastname ?? '',
        email: user.personalinfo.email ?? '',
        phonenumber: user.personalinfo.phonenumber ?? '',
      });
    }
  }, [user]);

  const isDirty = user
    ? formValues.firstname !== (user.personalinfo.firstname ?? '') ||
      formValues.middlename !== (user.personalinfo.middlename ?? '') ||
      formValues.lastname !== (user.personalinfo.lastname ?? '') ||
      formValues.email !== (user.personalinfo.email ?? '') ||
      formValues.phonenumber !== (user.personalinfo.phonenumber ?? '')
    : false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!user) return;
    updatePersonalInfo.mutate({ userId: user.id, data: formValues });
  };

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstname" className="text-sm font-medium text-gray-600 block mb-1">First Name</label>
                  <input
                    id="firstname"
                    name="firstname"
                    value={formValues.firstname}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="middlename" className="text-sm font-medium text-gray-600 block mb-1">Middle Name</label>
                  <input
                    id="middlename"
                    name="middlename"
                    value={formValues.middlename}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="text-sm font-medium text-gray-600 block mb-1">Last Name</label>
                  <input
                    id="lastname"
                    name="lastname"
                    value={formValues.lastname}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-600 block mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phonenumber" className="text-sm font-medium text-gray-600 block mb-1">Phone Number</label>
                  <input
                    id="phonenumber"
                    name="phonenumber"
                    value={formValues.phonenumber}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!isDirty || updatePersonalInfo.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updatePersonalInfo.isPending ? 'Saving...' : 'Save'}
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