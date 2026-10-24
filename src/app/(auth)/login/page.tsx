'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin, useVerifyLogin } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui';
import { AuthSplitLayout, glassInputClasses } from '@/components/auth/AuthSplitLayout';
import { OtpInput } from '@/components/auth/OtpInput';

const CODE_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [requestId, setRequestId] = useState<string>('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const loginMutation = useLogin();
  const verifyLoginMutation = useVerifyLogin();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    // Basic validation
    const newErrors: { [key: string]: string } = {};
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
      setCode('');
      setStep('verification');
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Login failed. Please check your credentials.' });
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (code.length !== CODE_LENGTH) {
      setErrors({ code: `Enter the ${CODE_LENGTH}-digit verification code` });
      return;
    }

    try {
      await verifyLoginMutation.mutateAsync({
        requestid: requestId,
        code,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Verification failed:', error);
      setErrors({ general: 'Verification failed. Please check your code.' });
    }
  };

  if (step === 'login') {
    return (
      <AuthSplitLayout>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <Label htmlFor="login">Email</Label>
            <Input
              name="login"
              id="login"
              type="text"
              autoComplete="username"
              className={glassInputClasses}
              placeholder="Enter your email"
            />
            {errors.login && (
              <p className="mt-1 text-sm text-red-200">{errors.login}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              name="password"
              id="password"
              type="password"
              autoComplete="current-password"
              className={glassInputClasses}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-200">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full !bg-white !text-gray-900 hover:!bg-white/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-white/90 hover:text-white hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {errors.general && (
            <div className="text-red-200 text-sm text-center">
              {errors.general}
            </div>
          )}
        </form>
      </AuthSplitLayout>
    );
  }

  // Verification step
  return (
    <AuthSplitLayout>
      <h1 className="mb-2 text-center text-2xl font-semibold">Enter Verification Code</h1>
      <p className="mb-6 text-center text-sm text-white/80">
        Enter the {CODE_LENGTH}-digit code we sent you.
      </p>
      <form onSubmit={handleVerificationSubmit} className="space-y-6">
        <div>
          <OtpInput
            value={code}
            onChange={setCode}
            length={CODE_LENGTH}
            disabled={verifyLoginMutation.isPending}
          />
          {errors.code && (
            <p className="mt-2 text-center text-sm text-red-200">{errors.code}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 !border-white/40 !bg-transparent !text-white hover:!bg-white/20"
            onClick={() => {
              setErrors({});
              setCode('');
              setStep('login');
            }}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 !bg-white !text-gray-900 hover:!bg-white/90"
            disabled={verifyLoginMutation.isPending}
          >
            {verifyLoginMutation.isPending ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        {errors.general && (
          <div className="text-red-200 text-sm text-center">
            {errors.general}
          </div>
        )}
      </form>
    </AuthSplitLayout>
  );
}
