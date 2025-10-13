'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useVerifyLogin } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';

export default function SimpleLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [requestId, setRequestId] = useState<string>('');
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    code: ''
  });
  
  const loginMutation = useLogin();
  const verifyLoginMutation = useVerifyLogin();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', formData);
    
    if (!formData.login || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await loginMutation.mutateAsync({
        login: formData.login,
        password: formData.password
      });
      setRequestId(response.requestid);
      setStep('verification');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      alert('Please enter verification code');
      return;
    }
    
    try {
      await verifyLoginMutation.mutateAsync({
        requestid: requestId,
        code: formData.code,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Simple Login Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onLoginSubmit} className="space-y-6">
              <div>
                <Label htmlFor="login">Username/Email</Label>
                <Input
                  id="login"
                  type="text"
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your username or email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>

              {loginMutation.error && (
                <div className="text-red-600 text-sm text-center">
                  Login failed. Please check your credentials.
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification step
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Enter Verification Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerificationSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="mt-1"
                placeholder="Enter verification code"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('login')}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verifyLoginMutation.isPending}
              >
                {verifyLoginMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {verifyLoginMutation.error && (
              <div className="text-red-600 text-sm text-center">
                Verification failed. Please check your code.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}