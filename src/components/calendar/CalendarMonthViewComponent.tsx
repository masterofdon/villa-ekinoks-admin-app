'use client';

import React from 'react';
import { VillaPricingWithVillaBooking } from '@/types';
import { parseYYYYMMDD, isDateInRange, getBookingPosition } from '@/lib/date-utils';

interface CalendarMonthViewComponentProps {
  period: string; // MMYYYY format
  pricing: VillaPricingWithVillaBooking;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  onStartDateAdjust?: (date: Date) => void;
  onEndDateAdjust?: (date: Date) => void;
  onMouseDown?: (date: Date) => void;
  onMouseEnter?: (date: Date) => void;
  onMouseUp?: () => void;
  isDragging?: boolean;
}

export const CalendarMonthViewComponent: React.FC<CalendarMonthViewComponentProps> = ({
  period,
  pricing,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onStartDateAdjust,
  onEndDateAdjust,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  isDragging
}) => {
  // Parse the period (MMYYYY)
  const month = parseInt(period.substring(0, 2)) - 1; // Month is 0-indexed
  const year = parseInt(period.substring(2, 6));

  // Get the first day of the month and how many days in the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  // We want Monday to be the first day, so adjust accordingly
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Convert to Monday = 0

  // Days of the week starting with Monday
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper function to get booking for a specific date (for availability - excludes checkout day)
  const getBookingForDate = (date: Date) => {
    return pricing.bookings.find(booking => {
      return isDateInRange(date, booking.startdate, booking.enddate);
    });
  };

  // Helper function to get booking for banner display (includes checkout day for visual continuity)
  const getBookingForBanner = (date: Date) => {
    return pricing.bookings.find(booking => {
      const startDate = parseYYYYMMDD(booking.startdate);
      const endDate = parseYYYYMMDD(booking.enddate);

      const normalizedCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      // Include both check-in and checkout dates for banner display
      return normalizedCheck >= normalizedStart && normalizedCheck <= normalizedEnd;
    });
  };

  // Helper function to check if a date has a booking (availability)
  const hasBooking = (date: Date) => {
    return !!getBookingForDate(date);
  };

  // Helper function to check if a date should show a banner
  const hasBanner = (date: Date) => {
    return !!getBookingForBanner(date);
  };

  // Helper function to get price for a specific date
  const getPriceForDate = (date: Date) => {
    const priceRange = pricing.pricing.pricingranges.find(range => {
      const startDate = parseYYYYMMDD(range.startperiod);
      const endDate = parseYYYYMMDD(range.endperiod);

      // Normalize all dates to compare only the date part (not time)
      const normalizedCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return normalizedCheck >= normalizedStart && normalizedCheck <= normalizedEnd;
    });

    return priceRange?.pricepernight;
  };

  // Helper function to check if a date is in the selected range
  const isDateSelected = (date: Date) => {
    if (!selectedStartDate) return false;

    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate());

    if (!selectedEndDate) {
      // Only start date selected
      return normalizedDate.getTime() === normalizedStart.getTime();
    }

    const normalizedEnd = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate());

    // Full range selected
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
  };

  // Helper function to check if a date is the start of selection
  const isSelectionStart = (date: Date) => {
    if (!selectedStartDate) return false;
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStart = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate());
    return normalizedDate.getTime() === normalizedStart.getTime();
  };

  // Helper function to check if a date is the end of selection
  const isSelectionEnd = (date: Date) => {
    if (!selectedEndDate) return false;
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedEnd = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate());
    return normalizedDate.getTime() === normalizedEnd.getTime();
  };

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const booking = getBookingForDate(date); // For availability (excludes checkout day)
    const bannerBooking = getBookingForBanner(date); // For banner display (includes checkout day)
    const isBooked = !!booking; // Availability status
    const showBanner = !!bannerBooking; // Banner display status
    const price = getPriceForDate(date);
    const isClosed = !isBooked && !showBanner && !price; // Closed if no booking, no banner, and no price
    const isSelected = isDateSelected(date); // Check if date is in selected range
    const isSelectStart = isSelectionStart(date); // Check if date is start of selection
    const isSelectEnd = isSelectionEnd(date); // Check if date is end of selection

    // Check if next day is an end date for showing name
    const nextDay = day < daysInMonth ? new Date(year, month, day + 1) : null;
    const nextDayBannerBooking = nextDay ? getBookingForBanner(nextDay) : null;
    const nextDayPositionInfo = nextDay && nextDayBannerBooking ? getBookingPosition(nextDay, nextDayBannerBooking.startdate, nextDayBannerBooking.enddate) : null;
    const isBeforeEndDate = nextDayPositionInfo?.isEnd && !nextDayPositionInfo?.isStart;

    // Use banner booking for position info since we want visual continuity including checkout day
    const positionInfo = bannerBooking ? getBookingPosition(date, bannerBooking.startdate, bannerBooking.enddate) : { isStart: false, isEnd: false, isMiddle: false };

    calendarDays.push({
      day,
      date,
      isBooked, // Availability (excludes checkout day)
      showBanner, // Banner visibility (includes checkout day)
      booking: bannerBooking, // Use banner booking for guest info
      price,
      bookingPosition: positionInfo,
      isBeforeEndDate, // True if next day is end date
      nextDayBooking: nextDayBannerBooking, // Booking info for next day
      isClosed, // True if day is closed (no booking, no banner, no price)
      isSelected, // True if date is in selected range
      isSelectStart, // True if date is start of selection
      isSelectEnd // True if date is end of selection
    });
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${isDragging ? 'select-none' : ''}`}>
      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border border-gray-200 bg-gray-100">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayData, index) => (
          <div key={index} className="aspect-square border border-gray-200">
            {dayData ? (
              <div
                className={`
                  relative h-full w-full p-1 flex flex-col justify-between
                  ${dayData.isSelected
                    ? '' // Selection will be handled by inline style
                    : dayData.isBooked
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : dayData.showBanner
                        ? 'bg-gray-50 hover:bg-gray-100' // Checkout day - same as available (gray)
                        : dayData.isClosed
                          ? 'bg-red-50 hover:bg-red-100' // Closed day - red background
                          : 'bg-gray-50 hover:bg-gray-100' // Available day - gray background
                  }
                  cursor-pointer transition-colors
                `}
                style={dayData.isSelected ? { backgroundColor: '#f0ad8d33' } : {}}
                title={
                  dayData.booking
                    ? `${dayData.isBooked ? 'Booked' : 'Checkout'} by ${dayData.booking.inquiror.personalinfo.firstname} ${dayData.booking.inquiror.personalinfo.lastname}`
                    : undefined
                }
                onClick={() => !isDragging && onDateSelect?.(dayData.date)}
                onMouseDown={() => onMouseDown?.(dayData.date)}
                onMouseEnter={() => onMouseEnter?.(dayData.date)}
                onMouseUp={() => onMouseUp?.()}
              >
                {/* Day number */}
                <div className={`text-sm font-medium ${dayData.isBooked ? 'text-blue-900' :
                  dayData.showBanner ? 'text-gray-900' :
                    dayData.isClosed ? 'text-red-900' :
                      'text-gray-900'
                  }`}>
                  {dayData.day}
                </div>

                {/* Booking banner */}
                {dayData.showBanner && (
                  <div className="absolute top-6 left-0 right-0">
                    <div
                      className={`
                        text-white text-xs py-0.5 text-center font-medium
                        ${dayData.bookingPosition.isStart && dayData.bookingPosition.isEnd
                          ? 'ml-6' // Same day check-in/out - start from center, end at 30% width
                          : ''
                        }
                        ${dayData.bookingPosition.isStart && !dayData.bookingPosition.isEnd
                          ? 'ml-6' // Check-in day - banner starts from center of cell
                          : ''
                        }
                        ${dayData.bookingPosition.isEnd && !dayData.bookingPosition.isStart
                          ? 'w-[30%] h-5' // Check-out day - banner is 30% width from left with explicit height matching py-0.5
                          : ''
                        }
                        ${dayData.bookingPosition.isMiddle
                          ? '' // Middle days - full width banner (entire day occupied)
                          : ''
                        }
                      `}
                      style={{
                        backgroundColor: '#5267e3',
                        ...(dayData.bookingPosition.isStart && dayData.bookingPosition.isEnd
                          ? { width: '30%', marginLeft: '1.5rem' }
                          : {}
                        )
                      }}
                    >
                      <div className="truncate px-1">
                        {dayData.bookingPosition.isStart
                          ? `${dayData.booking?.inquiror.personalinfo.firstname} ${dayData.booking?.inquiror.personalinfo.lastname}`
                          : dayData.isBeforeEndDate
                            ? `${dayData.nextDayBooking?.inquiror.personalinfo.firstname} ${dayData.nextDayBooking?.inquiror.personalinfo.lastname}`
                            : dayData.bookingPosition.isEnd
                              ? '' // Empty content for enddate cell
                              : '●' // Middle days show bullet
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* Closed banner */}
                {dayData.isClosed && (
                  <div className="absolute top-6 left-0 right-0">
                    <div
                      className="text-white text-xs py-0.5 text-center font-medium h-5"
                      style={{ backgroundColor: '#eb5a44' }}
                    >
                      <div className="truncate px-1">
                        Closed
                      </div>
                    </div>
                  </div>
                )}

                {/* Selection Handlers */}
                {dayData.isSelectStart && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                    <div
                      className="w-3 h-6 bg-blue-500 rounded-l-md cursor-ew-resize opacity-80 hover:opacity-100 transition-opacity"
                      title="Click to adjust start date"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartDateAdjust?.(dayData.date);
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-0.5 h-3 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                )}

                {dayData.isSelectEnd && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                    <div
                      className="w-3 h-6 bg-blue-500 rounded-r-md cursor-ew-resize opacity-80 hover:opacity-100 transition-opacity"
                      title="Click to adjust end date"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEndDateAdjust?.(dayData.date);
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-0.5 h-3 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price display */}
                <div className="mt-auto">
                  {dayData.isBooked ? (
                    <div className="text-xs text-blue-600 font-medium text-center">
                      Booked
                    </div>
                  ) : dayData.isClosed ? (
                    <div className="text-xs text-red-600 font-medium text-center">
                      Closed
                    </div>
                  ) : dayData.price ? (
                    <div className="flex justify-end">
                      <div className="text-xs text-gray-600">
                        {dayData.price.amount} {dayData.price.currency}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="h-full w-full border border-gray-200 bg-white"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};