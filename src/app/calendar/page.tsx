import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { CalendarManagementPage } from '@/components/calendar';

export default function CalendarPage() {
  return (
    <AuthGuard>
      <Sidebar>
        <CalendarManagementPage />
      </Sidebar>
    </AuthGuard>
  );
}