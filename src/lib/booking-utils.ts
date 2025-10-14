import { PaymentStatus, VillaBookingStatus } from '@/types';

/**
 * Utility functions for booking-related formatting and helpers
 */

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
} as const;

export const BOOKING_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REJECTED: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

/**
 * Get CSS classes for payment status badge
 */
export const getPaymentStatusColor = (status: PaymentStatus): string => {
  return PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.PENDING;
};

/**
 * Get CSS classes for booking status badge
 */
export const getBookingStatusColor = (status: VillaBookingStatus): string => {
  return BOOKING_STATUS_COLORS[status] || BOOKING_STATUS_COLORS.PENDING;
};

/**
 * Format currency amount with proper decimal places
 */
export const formatCurrency = (amount: string, currency: string): string => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return `0.00 ${currency}`;
  
  return `${numAmount.toFixed(2)} ${currency.toUpperCase()}`;
};

/**
 * Calculate booking duration in nights
 */
export const calculateBookingNights = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate || startDate.length !== 8 || endDate.length !== 8) {
    return 0;
  }
  
  const start = new Date(
    parseInt(startDate.substring(0, 4)),
    parseInt(startDate.substring(4, 6)) - 1,
    parseInt(startDate.substring(6, 8))
  );
  
  const end = new Date(
    parseInt(endDate.substring(0, 4)),
    parseInt(endDate.substring(4, 6)) - 1,
    parseInt(endDate.substring(6, 8))
  );
  
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(0, daysDiff);
};

/**
 * Get booking status priority for sorting (lower number = higher priority)
 */
export const getBookingStatusPriority = (status: VillaBookingStatus): number => {
  switch (status) {
    case 'PENDING': return 1;
    case 'CONFIRMED': return 2;
    case 'CANCELLED': return 3;
    case 'REJECTED': return 4;
    default: return 5;
  }
};

/**
 * Check if booking is active (confirmed and dates are current/future)
 */
export const isBookingActive = (booking: { status: VillaBookingStatus; enddate: string }): boolean => {
  if (booking.status !== 'CONFIRMED') return false;
  
  const today = new Date();
  const currentDateStr = today.getFullYear().toString() + 
    (today.getMonth() + 1).toString().padStart(2, '0') + 
    today.getDate().toString().padStart(2, '0');
  
  return booking.enddate >= currentDateStr;
};