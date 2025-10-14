'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useVillaBookings } from '@/hooks/api';
import { VillaBookingsFilter, VillaBookingSummaryView, VillaBookingStatus } from '@/types';
import { formatDisplayDate, formatDateTime, htmlDateToYYYYMMDD, yyyymmddToHtmlDate } from '@/lib/date-utils';
import { getBookingStatusColor, formatCurrency, calculateBookingNights } from '@/lib/booking-utils';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Search, Calendar, Users, CreditCard, Clock, Filter, Moon } from 'lucide-react';
import { BookingDetailsPage } from './BookingDetailsPage';

const BookingStatusBadge: React.FC<{ status: VillaBookingSummaryView['status'] }> = ({ status }) => {
  const colorClass = getBookingStatusColor(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

const BookingCard: React.FC<{ 
  booking: VillaBookingSummaryView;
  onClick?: (booking: VillaBookingSummaryView) => void;
}> = ({ booking, onClick }) => {
  const totalAmount = booking.bookingpayment ? parseFloat(booking.bookingpayment.amount) : 0;
  const servicesAmount = booking.services?.reduce((sum, service) =>
    sum + (service.payment ? parseFloat(service.payment.amount) * service.quantity : 0), 0) || 0;
  const bookingNights = calculateBookingNights(booking.startdate, booking.enddate);

  return (
    <Card 
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => onClick?.(booking)}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.lastname}
              </h3>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {booking.inquiror.personalinfo.email}
            </p>
            <p className="text-sm text-gray-600">
              {booking.inquiror.personalinfo.phonenumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Check-in</div>
              <div>{formatDisplayDate(booking.startdate)}</div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Check-out</div>
              <div>{formatDisplayDate(booking.enddate)}</div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Moon className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Nights</div>
              <div>{bookingNights}</div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Guests</div>
              <div>{booking.numberofguests}</div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Total</div>
              <div>
                {booking.bookingpayment
                  ? formatCurrency(booking.bookingpayment.amount, booking.bookingpayment.currency)
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>

        {booking.services && booking.services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Services</h4>
            <div className="space-y-1">
              {booking.services.map((service, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-600">
                  <span>{service.item.name} (x{service.quantity})</span>
                  <span>
                    {service.payment
                      ? formatCurrency((parseFloat(service.item.price.amount) * service.quantity).toString(), service.payment.currency)
                      : 'N/A'
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Created: {formatDateTime(booking.timestamps.creationdate)}
          </div>
          <div className="text-right">
            Booking ID: {booking.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BookingsFilterForm: React.FC<{
  filter: Omit<VillaBookingsFilter, 'villaid'>;
  onFilterChange: (filter: Omit<VillaBookingsFilter, 'villaid'>) => void;
  isLoading: boolean;
}> = ({ filter, onFilterChange, isLoading }) => {
  const [localStartDate, setLocalStartDate] = useState(yyyymmddToHtmlDate(filter.startdate || ''));
  const [localEndDate, setLocalEndDate] = useState(yyyymmddToHtmlDate(filter.enddate || ''));
  const [localQuery, setLocalQuery] = useState(filter.query || '');

  const handleFilterUpdate = () => {
    onFilterChange({
      ...filter,
      startdate: htmlDateToYYYYMMDD(localStartDate),
      enddate: htmlDateToYYYYMMDD(localEndDate),
      query: localQuery.trim() || undefined,
      page: 1, // Reset to first page when filtering
    });
  };

  const handleClearFilters = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setLocalQuery('');
    onFilterChange({
      page: 1,
      size: filter.size,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="startdate">Start Date</Label>
            <Input
              id="startdate"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="enddate">End Date</Label>
            <Input
              id="enddate"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="query">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="query"
                type="text"
                placeholder="Search by guest name, email, or booking ID..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilterUpdate}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Apply Filters'}
          </button>

          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              className={`px-3 py-2 text-sm font-medium border rounded-md ${page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export const BookingsManagementPage: React.FC<{
  mode?: 'modal' | 'navigation';
}> = ({ mode = 'navigation' }) => {
  const router = useRouter();
  const [filter, setFilter] = useState<Omit<VillaBookingsFilter, 'villaid'>>({
    page: 0,
    size: 10000,
  });

  const [selectedBooking, setSelectedBooking] = useState<VillaBookingSummaryView | null>(null);

  const { data: bookingsData, isLoading, error } = useVillaBookings(filter);

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilter(prev => ({ ...prev, size, page: 1 }));
  };

  const handleBookingClick = (booking: VillaBookingSummaryView) => {
    if (mode === 'navigation') {
      router.push(`/bookings/${booking.id}`);
    } else {
      setSelectedBooking(booking);
    }
  };

  const handleBackToList = () => {
    setSelectedBooking(null);
  };

  const handleStatusChange = async (bookingId: string, newStatus: VillaBookingStatus) => {
    // TODO: Implement API call to update booking status
    console.log('Updating booking status:', bookingId, newStatus);
    
    // Update the selected booking if it's the one being changed
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: newStatus,
        timestamps: {
          ...selectedBooking.timestamps,
          lastupdate: Date.now()
        }
      });
    }
  };

  const handleEditBooking = (bookingId: string) => {
    // TODO: Implement edit booking functionality
    console.log('Edit booking:', bookingId);
  };

  // If a booking is selected and we're in modal mode, show the details page
  if (selectedBooking && mode === 'modal') {
    return (
      <BookingDetailsPage
        booking={selectedBooking}
        onBack={handleBackToList}
        onStatusChange={handleStatusChange}
        onEdit={handleEditBooking}
      />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error Loading Bookings</p>
              <p className="text-sm">{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Villa Bookings</h1>
        <p className="text-gray-600">Manage and view all bookings for your villa</p>
      </div>

      <BookingsFilterForm
        filter={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
      />

      {isLoading && !bookingsData ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </CardContent>
        </Card>
      ) : bookingsData && bookingsData.content.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {bookingsData.content.length} of {bookingsData.totalElements} bookings
            </div>
          </div>
          <div className="space-y-4">
            {bookingsData.content.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onClick={handleBookingClick}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">
                {filter.query || filter.startdate || filter.enddate
                  ? 'No bookings match your current filters.'
                  : 'There are no bookings for your villa yet.'}
              </p>
              {(filter.query || filter.startdate || filter.enddate) && (
                <button
                  onClick={() => setFilter({ page: 1, size: filter.size })}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};