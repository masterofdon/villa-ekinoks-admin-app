'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResetPassword } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import styles from './page.module.css';

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
    <div className={styles.div}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className={styles.div2}>
              <p className={styles.p}>
                If an account exists for this email, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/login"
                className={styles.link}
              >
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={styles.input}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className={styles.p2}>{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className={styles.button}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {errors.general && (
                <div className={styles.div3}>
                  {errors.general}
                </div>
              )}

              <div className={styles.cardTitle}>
                <Link
                  href="/login"
                  className={styles.link}
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
