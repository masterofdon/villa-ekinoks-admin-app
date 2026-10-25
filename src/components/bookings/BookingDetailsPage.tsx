'use client';

import React, { useState } from 'react';
import { VillaBookingSummaryView, VillaBookingStatus } from '@/types';
import { formatDisplayDate, formatDateTime } from '@/lib/date-utils';
import { getBookingStatusColor, formatCurrency, calculateBookingNights } from '@/lib/booking-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useDeleteBooking } from '@/hooks/api';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Users,
  FileText,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Moon,
  Trash2
} from 'lucide-react';
import styles from './BookingDetailsPage.module.css';

interface BookingDetailsPageProps {
  booking: VillaBookingSummaryView;
  onBack: () => void;
  onStatusChange?: (bookingId: string, newStatus: VillaBookingStatus) => void;
  onEdit?: (bookingId: string) => void;
  onDelete?: (bookingId: string) => void;
}

const BookingStatusBadge: React.FC<{ status: VillaBookingSummaryView['status'] }> = ({ status }) => {
  const colorClass = getBookingStatusColor(status);

  return (
    <span className={`${styles.span} ${colorClass}`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.cls;
      case 'PENDING':
        return styles.cls2;
      case 'FAILED':
        return styles.cls3;
      case 'REFUNDED':
        return styles.cls4;
      default:
        return styles.cls4;
    }
  };

  const colorClass = getPaymentStatusColor(status);

  return (
    <span className={`${styles.span2} ${colorClass}`}>
      {status}
    </span>
  );
};

const InquirorDetailsSection: React.FC<{ booking: VillaBookingSummaryView }> = ({ booking }) => {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <User className={styles.user} />
          Guest Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.div}>
          {/* Primary Guest */}
          <div>
            <h4 className={styles.h4}>Primary Guest</h4>
            <div className={styles.div2}>
              <div>
                <p className={styles.p}>Full Name</p>
                <p className={styles.p2}>
                  {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.middlename} {booking.inquiror.personalinfo.lastname}
                </p>
              </div>
              <div>
                <p className={styles.p}>Email</p>
                <div className={styles.cardTitle}>
                  <Mail className={styles.mail} />
                  <p className={styles.p2}>{booking.inquiror.personalinfo.email}</p>
                </div>
              </div>
              <div>
                <p className={styles.p}>Phone</p>
                <div className={styles.cardTitle}>
                  <Phone className={styles.mail} />
                  <p className={styles.p2}>{booking.inquiror.personalinfo.phonenumber}</p>
                </div>
              </div>
              <div>
                <p className={styles.p}>Identity Number</p>
                <p className={styles.p2}>{booking.inquiror.identitynumber}</p>
              </div>
            </div>
          </div>

          {/* Additional Guests */}
          {booking.guests && booking.guests.length > 0 && (
            <div className={styles.div3}>
              <h4 className={styles.h4}>Additional Guests ({booking.guests.length})</h4>
              <div className={styles.div4}>
                {booking.guests.map((guest, index) => (
                  <div key={guest.id} className={styles.div5}>
                    <div className={styles.div6}>
                      <div>
                        <span className={styles.span3}>
                          {guest.personalinfo.firstname} {guest.personalinfo.lastname}
                        </span>
                        <p className={styles.p3}>Age: {guest.personalinfo.age}</p>
                      </div>
                      <div>
                        <p className={styles.p3}>{guest.personalinfo.email}</p>
                        <p className={styles.p3}>{guest.personalinfo.phonenumber}</p>
                      </div>
                      <div>
                        <p className={styles.p3}>Passport: {guest.personalinfo.passportno}</p>
                        <p className={styles.p3}>Country: {guest.personalinfo.passportcountry}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentDetailsSection: React.FC<{ booking: VillaBookingSummaryView }> = ({ booking }) => {
  const bookingNights = calculateBookingNights(booking.startdate, booking.enddate);

  const servicesTotal = booking.services?.reduce((sum, service) =>
    sum + (service.item.price ? Number.parseFloat(service.item.price.amount) * service.quantity : 0), 0) || 0;
  const totalAmount = booking.bookingpayment ? Number.parseFloat(booking.bookingpayment.amount) : 0;

  const sortedServices = booking.services ? [...booking.services].sort((a, b) => {
    const aPayment = a.payment;
    const bPayment = b.payment;

    if (aPayment && bPayment) {
      if (Number.parseFloat(aPayment.amount) > Number.parseFloat(bPayment.amount)) {
        return -1;
      } else if (Number.parseFloat(aPayment.amount) < Number.parseFloat(bPayment.amount)) {
        return 1;
      }
    }
    return 0;
  }) : [];
  return (
    <Card className={styles.card}>
      <CardHeader>
        <CardTitle className={styles.cardTitle}>
          <CreditCard className={styles.user} />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={styles.div}>
          {/* Main Booking Payment */}
          {booking.bookingpayment && (
            <div>
              <h4 className={styles.h4}>Accommodation Payment</h4>
              <div className={styles.div7}>
                <div className={styles.div8}>
                  <span className={styles.span4}>Payment Status</span>
                  <PaymentStatusBadge status={booking.bookingpayment.status} />
                </div>
                <div className={styles.div8}>
                  <span className={styles.span4}>Amount</span>
                  <span className={styles.span3}>
                    {formatCurrency(totalAmount.toFixed(2), booking.bookingpayment.currency)}
                  </span>
                </div>
                <div className={styles.div8}>
                  <span className={styles.span4}>External ID</span>
                  <span className={styles.span5}>{booking.bookingpayment.externalid}</span>
                </div>
                <div className={styles.div9}>
                  <span className={styles.span4}>Payment Date</span>
                  <span className={styles.span6}>{formatDateTime(new Date(booking.bookingpayment.creationdate).getTime())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Services */}
          {sortedServices.length > 0 && (
            <div>
              <h4 className={styles.h4}>Services</h4>
              <div className={styles.div4}>
                {sortedServices.map((service, index) => (
                  <div key={service.item.id} className={styles.div5}>
                    <div className={styles.div10}>
                      <div>
                        <p className={styles.span3}>{service.item.name}</p>
                        <p className={styles.span4}>{service.item.description}</p>
                      </div>
                      <div className={styles.div11}>
                        <p className={styles.span3}>
                          {formatCurrency((Number.parseFloat(service.item.price.amount) * service.quantity).toString(), service.item.price.currency)}
                        </p>
                        <p className={styles.span4}>Qty: {service.quantity}</p>
                      </div>
                    </div>
                    {service.payment && (
                      <div className={styles.div12}>
                        <PaymentStatusBadge status={service.payment.status} />
                        <span className={styles.span4}>ID: {service.payment.externalid}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
};

const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ message, onConfirm, onCancel, isLoading }) => (
  <div className={styles.div13}>
    <button
      type="button"
      className={styles.button}
      aria-label="Close dialog"
      onClick={onCancel}
    />
    <div className={styles.div14}>
      <h3 className={styles.h3}>Confirm Cancellation</h3>
      <p className={styles.p4}>{message}</p>
      <div className={styles.div15}>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          No, keep it
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={styles.button2}
        >
          {isLoading ? 'Cancelling...' : 'Yes, cancel booking'}
        </Button>
      </div>
    </div>
  </div>
);

const BookingOperationsSection: React.FC<{
  booking: VillaBookingSummaryView;
  onStatusChange?: (bookingId: string, newStatus: VillaBookingStatus) => void;
  onEdit?: (bookingId: string) => void;
  onDelete?: (bookingId: string) => void;
  onBack?: () => void;
}> = ({ booking, onStatusChange, onEdit, onDelete, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteBooking = useDeleteBooking();

  const handleStatusChange = async (newStatus: VillaBookingStatus) => {
    if (!onStatusChange) return;

    setIsLoading(true);
    try {
      await onStatusChange(booking.id, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBooking.mutateAsync(booking.id);
      onDelete?.(booking.id);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmDialog
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          isLoading={deleteBooking.isPending}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.div}>
            {/* Booking Info */}
            <div className={styles.div3}>
              <h4 className={styles.h4}>Booking Information</h4>
              <div className={styles.div16}>
                <div className={styles.div17}>
                  <span className={styles.p3}>Booking ID</span>
                  <span className={styles.span7}>{booking.id}</span>
                </div>
                <div className={styles.div17}>
                  <span className={styles.p3}>Created</span>
                  <span>{formatDateTime(booking.timestamps.creationdate)}</span>
                </div>
                {booking.timestamps.lastupdate && <div className={styles.div17}>
                  <span className={styles.p3}>Last Updated</span>
                  <span>{formatDateTime(booking.timestamps.lastupdate)}</span>
                </div>}
              </div>
            </div>

            {/* Danger Zone */}
            <div className={styles.div3}>
              <h4 className={styles.h42}>Danger Zone</h4>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className={styles.button3}
                disabled={deleteBooking.isPending}
              >
                <Trash2 className={styles.trash2} />
                Cancel Booking
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export const BookingDetailsPage: React.FC<BookingDetailsPageProps> = ({
  booking,
  onBack,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const bookingNights = calculateBookingNights(booking.startdate, booking.enddate);

  return (
    <div className={styles.div18}>
      {/* Header */}
      <div className={styles.div19}>
        <div className={styles.div9}>
          <div className={styles.cardTitle}>
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className={styles.button4}
            >
              <ArrowLeft className={styles.trash2} />
              Back to Bookings
            </Button>
            <div>
              <h1 className={styles.h1}>
                Booking Details
              </h1>
              <p className={styles.p3}>
                {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.lastname} • {formatDisplayDate(booking.startdate)} - {formatDisplayDate(booking.enddate)}
              </p>
            </div>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Content */}
      <div className={styles.div20}>
        <div className={styles.div21}>
          {/* Left Section - Main Content */}
          <div className={styles.div22}>
            {/* Booking Overview */}
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.cardTitle}>
                  <Calendar className={styles.user} />
                  Booking Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={styles.div23}>
                  <div className={styles.cardTitle}>
                    <Calendar className={styles.calendar} />
                    <div>
                      <p className={styles.span4}>Check-in</p>
                      <p className={styles.span3}>{formatDisplayDate(booking.startdate)}</p>
                    </div>
                  </div>

                  <div className={styles.cardTitle}>
                    <Calendar className={styles.calendar} />
                    <div>
                      <p className={styles.span4}>Check-out</p>
                      <p className={styles.span3}>{formatDisplayDate(booking.enddate)}</p>
                    </div>
                  </div>

                  <div className={styles.cardTitle}>
                    <Moon className={styles.calendar} />
                    <div>
                      <p className={styles.span4}>Nights</p>
                      <p className={styles.span3}>{bookingNights}</p>
                    </div>
                  </div>

                  <div className={styles.cardTitle}>
                    <Users className={styles.calendar} />
                    <div>
                      <p className={styles.span4}>Guests</p>
                      <p className={styles.span3}>{booking.numberofguests}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inquiror Details */}
            <InquirorDetailsSection booking={booking} />

            {/* Payment Details */}
            <PaymentDetailsSection booking={booking} />
          </div>

          {/* Right Section - Operations */}
          <div className={styles.div24}>
            <BookingOperationsSection
              booking={booking}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onBack={onBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};