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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REFUNDED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const colorClass = getPaymentStatusColor(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

const InquirorDetailsSection: React.FC<{ booking: VillaBookingSummaryView }> = ({ booking }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Guest Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Guest */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Primary Guest</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-gray-900">
                  {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.middlename} {booking.inquiror.personalinfo.lastname}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{booking.inquiror.personalinfo.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{booking.inquiror.personalinfo.phonenumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Identity Number</p>
                <p className="text-gray-900">{booking.inquiror.identitynumber}</p>
              </div>
            </div>
          </div>

          {/* Additional Guests */}
          {booking.guests && booking.guests.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Additional Guests ({booking.guests.length})</h4>
              <div className="space-y-3">
                {booking.guests.map((guest, index) => (
                  <div key={guest.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="font-medium">
                          {guest.personalinfo.firstname} {guest.personalinfo.lastname}
                        </span>
                        <p className="text-gray-600">Age: {guest.personalinfo.age}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{guest.personalinfo.email}</p>
                        <p className="text-gray-600">{guest.personalinfo.phonenumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Passport: {guest.personalinfo.passportno}</p>
                        <p className="text-gray-600">Country: {guest.personalinfo.passportcountry}</p>
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Booking Payment */}
          {booking.bookingpayment && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Accommodation Payment</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <PaymentStatusBadge status={booking.bookingpayment.status} />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-medium">
                    {formatCurrency(totalAmount.toFixed(2), booking.bookingpayment.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">External ID</span>
                  <span className="text-sm font-mono">{booking.bookingpayment.externalid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Date</span>
                  <span className="text-sm">{formatDateTime(new Date(booking.bookingpayment.creationdate).getTime())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Services */}
          {sortedServices.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Services</h4>
              <div className="space-y-3">
                {sortedServices.map((service, index) => (
                  <div key={service.item.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{service.item.name}</p>
                        <p className="text-sm text-gray-600">{service.item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency((Number.parseFloat(service.item.price.amount) * service.quantity).toString(), service.item.price.currency)}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {service.quantity}</p>
                      </div>
                    </div>
                    {service.payment && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <PaymentStatusBadge status={service.payment.status} />
                        <span className="text-sm text-gray-600">ID: {service.payment.externalid}</span>
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
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <button
      type="button"
      className="absolute inset-0 bg-black/40 w-full cursor-default"
      aria-label="Close dialog"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Cancellation</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          No, keep it
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white"
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
          <div className="space-y-4">
            {/* Booking Info */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Booking Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-mono">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span>{formatDateTime(booking.timestamps.creationdate)}</span>
                </div>
                {booking.timestamps.lastupdate && <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span>{formatDateTime(booking.timestamps.lastupdate)}</span>
                </div>}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-red-700 mb-3">Danger Zone</h4>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                disabled={deleteBooking.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h1>
              <p className="text-gray-600">
                {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.lastname} • {formatDisplayDate(booking.startdate)} - {formatDisplayDate(booking.enddate)}
              </p>
            </div>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Main Content */}
          <div className="lg:col-span-2">
            {/* Booking Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-medium">{formatDisplayDate(booking.startdate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-medium">{formatDisplayDate(booking.enddate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Moon className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nights</p>
                      <p className="font-medium">{bookingNights}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-medium">{booking.numberofguests}</p>
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
          <div className="lg:col-span-1">
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