'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useVerifyLogin, useAuthState } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [requestId, setRequestId] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const loginMutation = useLogin();
  const verifyLoginMutation = useVerifyLogin();
  const { isAuthenticated } = useAuthState();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;
    
    console.log('Form submitted with:', { login, password });
    
    // Basic validation
    const newErrors: {[key: string]: string} = {};
    if (!login || login.trim() === '') {
      newErrors.login = 'Login/Username is required';
    }
    if (!password || password.trim() === '') {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const response = await loginMutation.mutateAsync({
        login: login.trim(),
        password: password.trim()
      });
      console.log('Login response:', response);
      setRequestId(response.requestid);
      setStep('verification');
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Login failed. Please check your credentials.' });
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;
    
    if (!code || code.trim() === '') {
      setErrors({ code: 'Verification code is required' });
      return;
    }
    
    try {
      await verifyLoginMutation.mutateAsync({
        requestid: requestId,
        code: code.trim(),
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Verification failed:', error);
      setErrors({ general: 'Verification failed. Please check your code.' });
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Sign in to Villa Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <Label htmlFor="login">Username/Email</Label>
                <Input
                  name="login"
                  id="login"
                  type="text"
                  autoComplete="username"
                  className="mt-1"
                  placeholder="Enter your username or email"
                />
                {errors.login && (
                  <p className="mt-1 text-sm text-red-600">{errors.login}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-1"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>

              {errors.general && (
                <div className="text-red-600 text-sm text-center">
                  {errors.general}
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
          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                name="code"
                id="code"
                type="text"
                autoComplete="one-time-code"
                className="mt-1"
                placeholder="Enter verification code"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
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

            {errors.general && (
              <div className="text-red-600 text-sm text-center">
                {errors.general}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}