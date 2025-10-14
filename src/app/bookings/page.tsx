'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { BookingsManagementPage } from '@/components/bookings/BookingsManagementPage';

const BookingsPage: React.FC = () => {
  return (
    <AuthGuard>
      <Sidebar>
        <BookingsManagementPage />
      </Sidebar>
    </AuthGuard>
  );
};

export default BookingsPage;