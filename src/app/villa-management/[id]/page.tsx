'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Building2, ArrowLeft } from 'lucide-react';

export default function VillaManagementPage() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <AuthGuard>
      <Sidebar>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="text-xl font-semibold text-gray-900">
                Villa Management Moved
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Villa management has been integrated into the dashboard. You can now view and manage your villa details directly from the main dashboard.
              </p>
              <Button onClick={handleGoToDashboard} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </AuthGuard>
  );
}
