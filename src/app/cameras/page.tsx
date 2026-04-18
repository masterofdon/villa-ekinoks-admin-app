'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { CamerasPage } from '@/components/cameras/CamerasPage';

const CamerasRoute: React.FC = () => {
  return (
    <AuthGuard>
      <Sidebar>
        <CamerasPage />
      </Sidebar>
    </AuthGuard>
  );
};

export default CamerasRoute;
