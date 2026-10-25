'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogin, useVerifyLogin } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui';
import { AuthSplitLayout, glassInputClasses } from '@/components/auth/AuthSplitLayout';
import { OtpInput } from '@/components/auth/OtpInput';
import styles from './page.module.css';

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
        <form onSubmit={handleLoginSubmit} className={styles.form}>
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
              <p className={styles.p}>{errors.login}</p>
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
              <p className={styles.p}>{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className={styles.button}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className={styles.div}>
            <Link
              href="/forgot-password"
              className={styles.link}
            >
              Forgot your password?
            </Link>
          </div>

          {errors.general && (
            <div className={styles.div2}>
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
      <h1 className={styles.h1}>Enter Verification Code</h1>
      <p className={styles.p2}>
        Enter the {CODE_LENGTH}-digit code we sent you.
      </p>
      <form onSubmit={handleVerificationSubmit} className={styles.form}>
        <div>
          <OtpInput
            value={code}
            onChange={setCode}
            length={CODE_LENGTH}
            disabled={verifyLoginMutation.isPending}
          />
          {errors.code && (
            <p className={styles.p3}>{errors.code}</p>
          )}
        </div>

        <div className={styles.div3}>
          <Button
            type="button"
            variant="outline"
            className={styles.button2}
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
            className={styles.button3}
            disabled={verifyLoginMutation.isPending}
          >
            {verifyLoginMutation.isPending ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        {errors.general && (
          <div className={styles.div2}>
            {errors.general}
          </div>
        )}
      </form>
    </AuthSplitLayout>
  );
}
