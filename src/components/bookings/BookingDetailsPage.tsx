'use client';

import React, { useState } from 'react';
import { VillaBookingSummaryView, BookingFullDetails, VillaBookingStatus } from '@/types';
import { formatDisplayDate, formatDateTime } from '@/lib/date-utils';
import { getBookingStatusColor, formatCurrency, calculateBookingNights } from '@/lib/booking-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  Users, 
  MapPin, 
  FileText, 
  Download,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Moon,
  Euro
} from 'lucide-react';

interface BookingDetailsPageProps {
  booking: VillaBookingSummaryView;
  onBack: () => void;
  onStatusChange?: (bookingId: string, newStatus: VillaBookingStatus) => void;
  onEdit?: (bookingId: string) => void;
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
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">
                  {booking.inquiror.personalinfo.firstname} {booking.inquiror.personalinfo.middlename} {booking.inquiror.personalinfo.lastname}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{booking.inquiror.personalinfo.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{booking.inquiror.personalinfo.phonenumber}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Identity Number</label>
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
  const accommodationTotal = booking.bookingpayment ? parseFloat(booking.bookingpayment.amount) : 0;
  const servicesTotal = booking.services?.reduce((sum, service) => 
    sum + (service.payment ? parseFloat(service.payment.amount) * service.quantity : 0), 0) || 0;
  const totalAmount = accommodationTotal + servicesTotal;

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
                    {formatCurrency(booking.bookingpayment.amount, booking.bookingpayment.currency)}
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
          {booking.services && booking.services.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Additional Services</h4>
              <div className="space-y-3">
                {booking.services.map((service, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{service.item.name}</p>
                        <p className="text-sm text-gray-600">{service.item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency((parseFloat(service.item.price.amount) * service.quantity).toString(), service.item.price.currency)}
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

          {/* Payment Summary */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Accommodation ({bookingNights} nights)</span>
                <span>{formatCurrency(accommodationTotal.toString(), booking.bookingpayment?.currency || 'EUR')}</span>
              </div>
              {servicesTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Services</span>
                  <span>{formatCurrency(servicesTotal.toString(), booking.bookingpayment?.currency || 'EUR')}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total Amount</span>
                <span>{formatCurrency(totalAmount.toString(), booking.bookingpayment?.currency || 'EUR')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BookingOperationsSection: React.FC<{ 
  booking: VillaBookingSummaryView;
  onStatusChange?: (bookingId: string, newStatus: VillaBookingStatus) => void;
  onEdit?: (bookingId: string) => void;
}> = ({ booking, onStatusChange, onEdit }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: VillaBookingStatus) => {
    if (!onStatusChange) return;
    
    setIsLoading(true);
    try {
      await onStatusChange(booking.id, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const canConfirm = booking.status === 'PENDING';
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const canReject = booking.status === 'PENDING';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Actions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Booking Status</h4>
            <div className="space-y-2">
              {canConfirm && (
                <Button
                  onClick={() => handleStatusChange('CONFIRMED')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              )}
              
              {canReject && (
                <Button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Booking
                </Button>
              )}
              
              {canCancel && (
                <Button
                  onClick={() => handleStatusChange('CANCELLED')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Manage Booking</h4>
            <div className="space-y-2">
              <Button
                onClick={() => onEdit?.(booking.id)}
                variant="outline"
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Booking
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Confirmation
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Contract
              </Button>
            </div>
          </div>

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
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span>{formatDateTime(booking.timestamps.lastupdate)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const BookingDetailsPage: React.FC<BookingDetailsPageProps> = ({ 
  booking, 
  onBack, 
  onStatusChange, 
  onEdit 
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};