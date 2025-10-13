import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Authentication utilities
export function getStoredTokens() {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem('accesstoken');
  const refreshToken = localStorage.getItem('refreshtoken');
  
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

export function clearAuthTokens() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getStoredTokens()?.accessToken;
}