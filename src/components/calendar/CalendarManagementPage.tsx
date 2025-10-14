'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { CalendarMonthViewComponent } from '@/components/calendar/CalendarMonthViewComponent';
import { VillaPricingWithVillaBooking } from '@/types';
import { useCurrentVillaPricing, useAuthState } from '@/hooks/api';
import { api } from '@/lib/api';

// Types for pricing operations
type UpdatePricingRangeAction = "ADD" | "DELETE";

type Price = {
  amount: string;
  currency: string;
};

type Update_PricingRange_WC_MLS_XAction = {
  action: UpdatePricingRangeAction;
  startperiod: string; // YYYYMMDD
  endperiod: string; // YYYYMMDD
  pricepernight: Price;
};

interface CalendarManagementPageProps {
  initialPricing?: VillaPricingWithVillaBooking;
}

export const CalendarManagementPage: React.FC<CalendarManagementPageProps> = ({
  initialPricing
}) => {
  // Initialize with current month/year
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  // Selection state
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [adjustmentMode, setAdjustmentMode] = useState<'start' | 'end' | null>(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);

  // Pricing operations state
  const [selectedAction, setSelectedAction] = useState<UpdatePricingRangeAction>('ADD');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('USD');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch pricing data from API
  const { data: pricingData, isLoading, error } = useCurrentVillaPricing();
  
  // Get authenticated user
  const { user } = useAuthState();
  
  // Query client for invalidating queries
  const queryClient = useQueryClient();  // Use initialPricing prop or API data, fallback to mock data
  const mockPricing: VillaPricingWithVillaBooking = {
    pricing: {
      id: "pricing-1",
      pricingranges: [
        {
          id: "range-1",
          startperiod: "20251001",
          endperiod: "20251008", // End before Oct 9-10 (which will be closed)
          pricepernight: {
            amount: "150",
            currency: "USD"
          }
        },
        {
          id: "range-2",
          startperiod: "20251019", // Start from Oct 19 (after booked period ends on Oct 18)
          endperiod: "20251231",
          pricepernight: {
            amount: "150",
            currency: "USD"
          }
        }
      ]
    },
    bookings: [
      {
        id: "booking-1",
        startdate: "20251011",
        enddate: "20251018",
        inquiror: {
          id: "user-1",
          personalinfo: {
            firstname: "John",
            middlename: "",
            lastname: "Doe",
            email: "john.doe@example.com",
            phonenumber: "+1234567890",
            identitynumber: "12345"
          }
        }
      },
      {
        id: "booking-2",
        startdate: "20251020",
        enddate: "20251025",
        inquiror: {
          id: "user-2",
          personalinfo: {
            firstname: "Jane",
            middlename: "",
            lastname: "Smith",
            email: "jane.smith@example.com",
            phonenumber: "+1234567891",
            identitynumber: "12346"
          }
        }
      }
    ]
  };

  const pricing = initialPricing || pricingData || mockPricing;

  // Format period as MMYYYY
  const getPeriodString = (month: number, year: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    return `${monthStr}${year}`;
  };

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  // Selection handler
  const handleDateSelect = (date: Date) => {
    if (adjustmentMode === 'start') {
      // Adjusting start date
      if (!selectedEndDate || date <= selectedEndDate) {
        setSelectedStartDate(date);
      } else {
        // If new start is after end, swap them
        setSelectedStartDate(selectedEndDate);
        setSelectedEndDate(date);
      }
      setAdjustmentMode(null);
    } else if (adjustmentMode === 'end') {
      // Adjusting end date
      if (!selectedStartDate || date >= selectedStartDate) {
        setSelectedEndDate(date);
      } else {
        // If new end is before start, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      }
      setAdjustmentMode(null);
    } else {
      // Normal selection logic
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Start new selection
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else if (selectedStartDate && !selectedEndDate) {
        // Complete selection
        if (date >= selectedStartDate) {
          setSelectedEndDate(date);
        } else {
          // If selected date is before start date, make it the new start date
          setSelectedStartDate(date);
          setSelectedEndDate(null);
        }
      }
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setAdjustmentMode(null);
  };

  // Helper function to format date to YYYYMMDD
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Handle pricing range update
  const handleSavePricingRange = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert('Please select a date range first');
      return;
    }

    if (selectedAction === 'ADD' && (!priceAmount || !priceCurrency)) {
      alert('Please enter price amount and currency');
      return;
    }

    // Validate price amount format for ADD action
    if (selectedAction === 'ADD') {
      const priceNumber = parseFloat(priceAmount);
      
      // Check if it's a valid number
      if (isNaN(priceNumber) || priceNumber <= 0) {
        alert('Price amount must be a valid positive number');
        return;
      }
      
      // Check if it has more than 2 decimal places
      const decimalPart = priceAmount.includes('.') ? priceAmount.split('.')[1] : '';
      if (decimalPart.length > 2) {
        alert('Price amount should have at most 2 decimal places (e.g., 150.99)');
        return;
      }
      
      // Format to ensure proper d.dd format
      const formattedPrice = priceNumber.toFixed(2);
      if (priceAmount !== formattedPrice && priceAmount !== priceNumber.toString()) {
        // Update the input field to show the correct format
        setPriceAmount(formattedPrice);
        alert('Price amount has been formatted to 2 decimal places');
        return;
      }
    }

    if (!user) {
      alert('User not authenticated');
      return;
    }

    // Get villa ID from authenticated user
    const villaId = (user as any).villa?.id;
    if (!villaId) {
      alert('No villa associated with this user');
      return;
    }

    setIsSaving(true);

    try {
      const payload: Update_PricingRange_WC_MLS_XAction = {
        action: selectedAction,
        startperiod: formatDateToYYYYMMDD(selectedStartDate),
        endperiod: formatDateToYYYYMMDD(selectedEndDate),
        pricepernight: {
          amount: selectedAction === 'ADD' ? parseFloat(priceAmount).toFixed(2) : priceAmount,
          currency: priceCurrency
        }
      };

      const response = await api.put(`/villas/${villaId}/pricing-schema/pricing-ranges`, payload);

      // Invalidate pricing query to refetch updated data
      await queryClient.invalidateQueries({ queryKey: ['current-villa-pricing'] });
      
      alert('Pricing range updated successfully!');
      clearSelection();
      setPriceAmount('');

    } catch (error) {
      console.error('Error updating pricing range:', error);
      alert('Failed to update pricing range. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle start date adjustment
  const handleStartDateAdjust = (currentDate: Date) => {
    setAdjustmentMode('start');
  };

  // Handle end date adjustment  
  const handleEndDateAdjust = (currentDate: Date) => {
    setAdjustmentMode('end');
  };

  // Drag selection handlers
  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStartDate(date);
    setSelectedStartDate(date);
    setSelectedEndDate(null);
    setAdjustmentMode(null);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      if (date >= dragStartDate) {
        setSelectedStartDate(dragStartDate);
        setSelectedEndDate(date);
      } else {
        setSelectedStartDate(date);
        setSelectedEndDate(dragStartDate);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
  };

  // Global mouse up event listener to handle drag ending outside calendar
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-[10%] py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading calendar data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !initialPricing) {
    return (
      <div className="min-h-screen bg-gray-50 px-[10%] py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-blue-600">
            Error: {error?.message || 'Failed to load pricing data'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-[12px] py-8">
      <div className="flex gap-8 h-full">
        {/* Left side - Calendar Section (80%) */}
        <div className="w-4/5">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendar</h1>

          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={goToPreviousMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </Button>

            <h2 className="text-2xl font-semibold text-gray-800">
              {getMonthName(currentMonth)} {currentYear}
            </h2>

            <Button
              onClick={goToNextMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>

          {/* Calendar Component */}
          <CalendarMonthViewComponent
            period={getPeriodString(currentMonth, currentYear)}
            pricing={pricing}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            onDateSelect={handleDateSelect}
            onStartDateAdjust={handleStartDateAdjust}
            onEndDateAdjust={handleEndDateAdjust}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseUp={handleMouseUp}
            isDragging={isDragging}
          />
        </div>

        {/* Right side - Operations Section (20%) */}
        <div className="w-1/5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations</h3>

            {/* Selection Info */}
            {(selectedStartDate || selectedEndDate || isDragging) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Period</h4>
                {isDragging && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded mb-2">
                    Dragging to select range...
                  </div>
                )}
                {adjustmentMode && !isDragging && (
                  <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded mb-2">
                    Adjusting {adjustmentMode} date - click a new date
                  </div>
                )}
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Start: {selectedStartDate?.toLocaleDateString() || 'Not selected'}</div>
                  <div>End: {selectedEndDate?.toLocaleDateString() || 'Not selected'}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={clearSelection}
                  disabled={isDragging}
                >
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Pricing Operations */}
            {selectedStartDate && selectedEndDate && !isDragging && !adjustmentMode && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-3">Pricing Operations</h4>

                {/* Action Selection */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Action</label>
                  <div className="space-y-1">
                    <label className="flex items-center text-xs">
                      <input
                        type="radio"
                        name="action"
                        value="ADD"
                        checked={selectedAction === 'ADD'}
                        onChange={(e) => setSelectedAction(e.target.value as UpdatePricingRangeAction)}
                        className="mr-2"
                      />
                      Add Pricing Range
                    </label>
                    <label className="flex items-center text-xs">
                      <input
                        type="radio"
                        name="action"
                        value="DELETE"
                        checked={selectedAction === 'DELETE'}
                        onChange={(e) => setSelectedAction(e.target.value as UpdatePricingRangeAction)}
                        className="mr-2"
                      />
                      Delete Pricing Range
                    </label>
                  </div>
                </div>

                {/* Price Input (only for ADD action) */}
                {selectedAction === 'ADD' && (
                  <div className="mb-3 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        placeholder="150.00"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="text-xs text-gray-500 mt-1">Format: 150.00</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Currency</label>
                      <select
                        value={priceCurrency}
                        onChange={(e) => setPriceCurrency(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="TRY">TRY</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleSavePricingRange}
                  disabled={isSaving || (selectedAction === 'ADD' && (!priceAmount || !priceCurrency))}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}

            {/* Other Operations */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                View Bookings
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Export Calendar
              </Button>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-50 border border-gray-200 relative">
                    <div className="absolute inset-x-0 top-0.5">
                      <div className="h-1" style={{ backgroundColor: '#5267e3' }}></div>
                    </div>
                  </div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 border border-gray-200 relative">
                    <div className="absolute inset-x-0 top-0.5 mr-1">
                      <div className="h-1" style={{ backgroundColor: '#5267e3' }}></div>
                    </div>
                  </div>
                  <span>Checkout (Available)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 border border-gray-200 relative">
                    <div className="absolute inset-x-0 top-0.5">
                      <div className="h-1" style={{ backgroundColor: '#eb5a44' }}></div>
                    </div>
                  </div>
                  <span>Closed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 border border-gray-200"
                    style={{ backgroundColor: '#f0ad8d33' }}
                  ></div>
                  <span>Selected Period</span>
                </div>
              </div>

              {/* Selection Info */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selection</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• Click to start/end selection</p>
                  <p>• Drag to select a range</p>
                  <p>• Click handlers to adjust dates</p>
                  <p>• Blue handles appear on edges</p>
                  <p>• Selected range enables pricing ops</p>
                  <p>• Use Clear Selection to reset</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Info</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• Check-in: Noon onwards</p>
                  <p>• Check-out: Before noon</p>
                  <p>• Checkout days: Available for booking</p>
                  <p>• Hover for guest details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};