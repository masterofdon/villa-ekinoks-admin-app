'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVillaBookings } from '@/hooks/api';
import { VillaBookingsFilter, VillaBookingSummaryView, VillaBookingStatus } from '@/types';
import { formatDisplayDate, formatDateTime, htmlDateToYYYYMMDD, yyyymmddToHtmlDate } from '@/lib/date-utils';
import { getBookingStatusColor, formatCurrency, calculateBookingNights } from '@/lib/booking-utils';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Search, Calendar, Users, CreditCard, Clock, Filter, Moon, Plus } from 'lucide-react';
import { BookingDetailsPage } from './BookingDetailsPage';
import { CreateManualBookingModal } from './CreateManualBookingModal';
import styles from './BookingsManagementPage.module.css';

const BookingStatusBadge: React.FC<{ status: VillaBookingSummaryView['status'] }> = ({ status }) => {
  const colorClass = getBookingStatusColor(status);

  return (
    <span className={`${styles.span} ${colorClass}`}>
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
      className={styles.card}
      onClick={() => onClick?.(booking)}
    >
      <CardContent className={styles.cardContent}>
        <div className={styles.div}>
          <div className={styles.div2}>
            <div className={styles.div3}>
              <h3 className={styles.h3}>
                {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.lastname}
              </h3>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className={styles.p}>
              {booking.inquiror.personalinfo.email}
            </p>
            <p className={styles.p2}>
              {booking.inquiror.personalinfo.phonenumber}
            </p>
          </div>
        </div>

        <div className={styles.div4}>
          <div className={styles.div5}>
            <Calendar className={styles.calendar} />
            <div>
              <div className={styles.div6}>Check-in</div>
              <div>{formatDisplayDate(booking.startdate)}</div>
            </div>
          </div>

          <div className={styles.div5}>
            <Calendar className={styles.calendar} />
            <div>
              <div className={styles.div6}>Check-out</div>
              <div>{formatDisplayDate(booking.enddate)}</div>
            </div>
          </div>

          <div className={styles.div5}>
            <Moon className={styles.calendar} />
            <div>
              <div className={styles.div6}>Nights</div>
              <div>{bookingNights}</div>
            </div>
          </div>

          <div className={styles.div5}>
            <Users className={styles.calendar} />
            <div>
              <div className={styles.div6}>Guests</div>
              <div>{booking.numberofguests}</div>
            </div>
          </div>

          <div className={styles.div5}>
            <CreditCard className={styles.calendar} />
            <div>
              <div className={styles.div6}>Total</div>
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
          <div className={styles.div7}>
            <h4 className={styles.h4}>Additional Services</h4>
            <div className={styles.div8}>
              {booking.services.map((service, index) => (
                <div key={index} className={styles.div9}>
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

        <div className={styles.div10}>
          <div className={styles.div11}>
            <Clock className={styles.clock} />
            Created: {formatDateTime(booking.timestamps.creationdate)}
          </div>
          <div className={styles.div12}>
            Booking ID: {booking.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type BookingsFilterState = Omit<VillaBookingsFilter, 'villaid'>;

const BookingsToolbar: React.FC<{
  filter: BookingsFilterState;
  onFilterChange: React.Dispatch<React.SetStateAction<BookingsFilterState>>;
  onNewBooking: () => void;
}> = ({ filter, onFilterChange, onNewBooking }) => {
  const [localQuery, setLocalQuery] = useState(filter.query || '');
  const [filtersOpen, setFiltersOpen] = useState(Boolean(filter.startdate || filter.enddate));

  // Keep the input in sync when the filter is reset from outside (e.g. empty-state button)
  const [prevFilterQuery, setPrevFilterQuery] = useState(filter.query);
  if (filter.query !== prevFilterQuery) {
    setPrevFilterQuery(filter.query);
    if ((filter.query || '') !== localQuery.trim()) setLocalQuery(filter.query || '');
  }

  // Debounce search input before applying it to the filter
  useEffect(() => {
    const trimmed = localQuery.trim();
    if (trimmed === (filter.query || '')) return;
    const timer = setTimeout(() => {
      onFilterChange(prev => ({ ...prev, query: trimmed || undefined, page: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, filter.query, onFilterChange]);

  const activeDateFilters = (filter.startdate ? 1 : 0) + (filter.enddate ? 1 : 0);

  const handleDateChange = (key: 'startdate' | 'enddate', value: string) => {
    onFilterChange(prev => ({ ...prev, [key]: htmlDateToYYYYMMDD(value) || undefined, page: 0 }));
  };

  const handleClearDates = () => {
    onFilterChange(prev => ({ ...prev, startdate: undefined, enddate: undefined, page: 0 }));
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarRow}>
        <div className={styles.searchWrapper}>
          <Search className={styles.search} />
          <Input
            id="query"
            type="text"
            aria-label="Search bookings"
            placeholder="Search by guest name, email, or booking ID..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className={styles.input2}
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(open => !open)}
          aria-expanded={filtersOpen}
          className={`${styles.button2} ${styles.filtersButton} ${filtersOpen ? styles.filtersButtonActive : ''}`}
        >
          <Filter className={styles.plus} />
          Filters
          {activeDateFilters > 0 && <span className={styles.filterCount}>{activeDateFilters}</span>}
        </button>

        <button type="button" onClick={onNewBooking} className={`${styles.button8} ${styles.newBookingButton}`}>
          <Plus className={styles.plus} />
          New Booking
        </button>
      </div>

      {filtersOpen && (
        <div className={styles.filtersRow}>
          <div className={styles.dateField}>
            <Label htmlFor="startdate">Start Date</Label>
            <Input
              id="startdate"
              type="date"
              value={yyyymmddToHtmlDate(filter.startdate || '')}
              onChange={(e) => handleDateChange('startdate', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.dateField}>
            <Label htmlFor="enddate">End Date</Label>
            <Input
              id="enddate"
              type="date"
              value={yyyymmddToHtmlDate(filter.enddate || '')}
              onChange={(e) => handleDateChange('enddate', e.target.value)}
              className={styles.input}
            />
          </div>

          <button
            type="button"
            onClick={handleClearDates}
            disabled={activeDateFilters === 0}
            className={styles.button2}
          >
            Clear Dates
          </button>
        </div>
      )}
    </div>
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
    <div className={styles.div17}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className={styles.button3}
      >
        Previous
      </button>

      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className={styles.span2}>...</span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              disabled={isLoading}
              className={`${styles.button4} ${page === currentPage
                ? styles.button6
                : styles.button7
                } ${styles.button5}`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className={styles.button3}
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: bookingsData, isLoading, error } = useVillaBookings(filter);

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilter(prev => ({ ...prev, size, page: 0 }));
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

    if (newStatus === 'CANCELLED') {
      setSelectedBooking(null);
      return;
    }

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

  const handleDeleteBooking = (bookingId: string) => {
    setSelectedBooking(null);
  };

  // If a booking is selected and we're in modal mode, show the details page
  if (selectedBooking && mode === 'modal') {
    return (
      <BookingDetailsPage
        booking={selectedBooking}
        onBack={handleBackToList}
        onStatusChange={handleStatusChange}
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
      />
    );
  }

  if (error) {
    return (
      <div className={styles.cardContent}>
        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div18}>
              <p className={styles.p3}>Error Loading Bookings</p>
              <p className={styles.p4}>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.div19}>
      <BookingsToolbar
        filter={filter}
        onFilterChange={setFilter}
        onNewBooking={() => setIsCreateModalOpen(true)}
      />

      {isLoading && !bookingsData ? (
        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div20}>
              <div className={styles.div21}></div>
              <p className={styles.p5}>Loading bookings...</p>
            </div>
          </CardContent>
        </Card>
      ) : bookingsData && bookingsData.content.length > 0 ? (
        <>
          <div className={styles.div23}>
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
          <CardContent className={styles.cardContent}>
            <div className={styles.div20}>
              <Calendar className={styles.calendar2} />
              <h3 className={styles.h32}>No Bookings Found</h3>
              <p className={styles.p6}>
                {filter.query || filter.startdate || filter.enddate
                  ? 'No bookings match your current filters.'
                  : 'There are no bookings for your villa yet.'}
              </p>
              {(filter.query || filter.startdate || filter.enddate) && (
                <button
                  onClick={() => setFilter({ page: 0, size: filter.size })}
                  className={styles.button9}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateManualBookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};