'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingDetailsPage } from '@/components/bookings/BookingDetailsPage';
import { usePageBreadcrumbLabel } from '@/components/layout/BreadcrumbContext';
import { useVillaBookings } from '@/hooks/api';
import { VillaBookingStatus } from '@/types';
import styles from './page.module.css';

const IndividualBookingPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  // For now, we'll use the existing hook to get all bookings and find the specific one
  // In a real application, you'd want a separate hook to fetch a single booking
  const { data: bookingsData, isLoading, error } = useVillaBookings({
    page: 0,
    size: 10000,
  });

  const booking = bookingsData?.content.find(b => b.id === bookingId);

  const guestInfo = booking?.inquiror?.personalinfo;
  usePageBreadcrumbLabel(guestInfo ? [guestInfo.firstname, guestInfo.lastname].filter(Boolean).join(' ') : null);

  const handleBack = () => {
    router.push('/bookings');
  };

  const handleStatusChange = async (bookingId: string, newStatus: VillaBookingStatus) => {
    // TODO: Implement API call to update booking status
    console.log('Updating booking status:', bookingId, newStatus);
  };

  const handleEditBooking = (bookingId: string) => {
    // TODO: Implement edit booking functionality
    console.log('Edit booking:', bookingId);
  };

  const handleDeleteBooking = () => {
    router.push('/bookings');
  };

  if (isLoading) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div className={styles.div3}></div>
          <p className={styles.p}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <h2 className={styles.h2}>Booking Not Found</h2>
          <p className={styles.p2}>
            The booking you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className={styles.button}
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookingDetailsPage
      booking={booking}
      onBack={handleBack}
      onStatusChange={handleStatusChange}
      onEdit={handleEditBooking}
      onDelete={handleDeleteBooking}
    />
  );
};

export default IndividualBookingPage;