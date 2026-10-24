'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResetPassword } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!email || email.trim() === '') {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ email: email.trim() });
      setSubmitted(true);
    } catch (error) {
      console.error('Reset password failed:', error);
      setErrors({ general: 'Failed to send reset request. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                If an account exists for this email, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {errors.general && (
                <div className="text-red-600 text-sm text-center">
                  {errors.general}
                </div>
              )}

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
