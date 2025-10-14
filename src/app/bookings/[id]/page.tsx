'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { BookingDetailsPage } from '@/components/bookings/BookingDetailsPage';
import { useVillaBookings } from '@/hooks/api';
import { VillaBookingStatus } from '@/types';

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

  if (isLoading) {
    return (
      <AuthGuard>
        <Sidebar>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </Sidebar>
      </AuthGuard>
    );
  }

  if (error || !booking) {
    return (
      <AuthGuard>
        <Sidebar>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
              <p className="text-gray-600 mb-4">
                The booking you're looking for doesn't exist or has been removed.
              </p>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Bookings
              </button>
            </div>
          </div>
        </Sidebar>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Sidebar>
        <BookingDetailsPage
          booking={booking}
          onBack={handleBack}
          onStatusChange={handleStatusChange}
          onEdit={handleEditBooking}
        />
      </Sidebar>
    </AuthGuard>
  );
};

export default IndividualBookingPage;