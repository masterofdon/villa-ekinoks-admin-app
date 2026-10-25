'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentUser, useUpdatePersonalInfo } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Save } from 'lucide-react';
import type { VillaAdminUser, Update_VillaAdminUserPersonalInfo_WC_MLS_XAction } from '@/types';
import styles from './page.module.css';

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
    <div className={styles.div}>
      <div>
        <h1 className={styles.h1}>Settings</h1>
        <p className={styles.p}>
          Manage your account preferences and application settings.
        </p>
      </div>
      <Card>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            <User className={styles.user} />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.div2}>
            <div>
              <label htmlFor="firstname" className={styles.label}>First Name</label>
              <input
                id="firstname"
                name="firstname"
                value={formValues.firstname}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="middlename" className={styles.label}>Middle Name</label>
              <input
                id="middlename"
                name="middlename"
                value={formValues.middlename}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="lastname" className={styles.label}>Last Name</label>
              <input
                id="lastname"
                name="lastname"
                value={formValues.lastname}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.div3}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="phonenumber" className={styles.label}>Phone Number</label>
              <input
                id="phonenumber"
                name="phonenumber"
                value={formValues.phonenumber}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.div4}>
            <Button
              onClick={handleSave}
              disabled={!isDirty || updatePersonalInfo.isPending}
            >
              <Save className={styles.save} />
              {updatePersonalInfo.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            <Bell className={styles.user} />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.div5}>
            <div>
              <h4 className={styles.h4}>Email Notifications</h4>
              <p className={styles.p2}>Receive booking updates via email</p>
            </div>
            <Button variant="outline" disabled>
              Configure (Coming Soon)
            </Button>
          </div>
          <div className={styles.div5}>
            <div>
              <h4 className={styles.h4}>SMS Notifications</h4>
              <p className={styles.p2}>Receive urgent alerts via SMS</p>
            </div>
            <Button variant="outline" disabled>
              Configure (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            <Lock className={styles.user} />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.div5}>
            <div>
              <h4 className={styles.h4}>Change Password</h4>
              <p className={styles.p2}>Update your account password</p>
            </div>
            <Button variant="outline" disabled>
              Change (Coming Soon)
            </Button>
          </div>
          <div className={styles.div5}>
            <div>
              <h4 className={styles.h4}>Two-Factor Authentication</h4>
              <p className={styles.p2}>Add an extra layer of security</p>
            </div>
            <Button variant="outline" disabled>
              Enable (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
      {villaAdminUser?.villa && (
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>
              <SettingsIcon className={styles.user} />
              Villa Management
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      <Card>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            <Palette className={styles.user} />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <div className={styles.div5}>
            <div>
              <h4 className={styles.h4}>Theme</h4>
              <p className={styles.p2}>Customize the appearance of your dashboard</p>
            </div>
            <Button variant="outline" disabled>
              Change Theme (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}