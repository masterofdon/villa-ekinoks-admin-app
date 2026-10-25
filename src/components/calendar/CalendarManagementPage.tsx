'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarListView } from '@/components/calendar/CalendarListView';
import { CalendarMonthsView } from '@/components/calendar/CalendarMonthsView';
import { CalendarYearView } from '@/components/calendar/CalendarYearView';
import type { CalendarScrollTarget } from '@/components/calendar/calendarViewTypes';
import {
  addMonths,
  buildCalendarIndex,
  CalendarFocus,
  clampSelectionEnd,
  isDateSelectable,
  isRangeSelectable,
  CalendarViewMode,
  MONTH_NAMES
} from '@/lib/calendar-utils';
import { VillaPricingWithVillaBooking } from '@/types';
import { useCurrentVillaPricing, useAuthState } from '@/hooks/api';
import { notification } from 'antd';
import { api } from '@/lib/api';
import styles from './CalendarManagementPage.module.css';

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

type PriceCheck =
  | { ok: true }
  | { ok: false; level: 'error' | 'warning' | 'info'; message: string; reformat?: string };

const checkPriceAmount = (amount: string, currency: string): PriceCheck => {
  if (!amount || !currency) {
    return { ok: false, level: 'warning', message: 'Please enter price amount and currency' };
  }

  const priceNumber = Number.parseFloat(amount);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    return { ok: false, level: 'error', message: 'Price amount must be a valid positive number' };
  }

  const decimalPart = amount.includes('.') ? amount.split('.')[1] : '';
  if (decimalPart.length > 2) {
    return {
      ok: false,
      level: 'warning',
      message: 'Price amount should have at most 2 decimal places (e.g., 150.99)'
    };
  }

  const formattedPrice = priceNumber.toFixed(2);
  if (amount !== formattedPrice && amount !== priceNumber.toString()) {
    return {
      ok: false,
      level: 'info',
      message: 'Price amount has been formatted to 2 decimal places',
      reformat: formattedPrice
    };
  }

  return { ok: true };
};

const VIEW_MODE_STORAGE_KEY = 'calendar-view-mode';
const DEFAULT_VIEW_MODE: CalendarViewMode = 'month';
// Year view opens on the row holding the last three months of the current year
const YEAR_VIEW_OPEN_MONTH = 9;

const readSavedViewMode = (): CalendarViewMode => {
  if (typeof window === 'undefined') return DEFAULT_VIEW_MODE;
  const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return saved === 'list' || saved === 'month' || saved === 'year' ? saved : DEFAULT_VIEW_MODE;
};

interface CalendarManagementPageProps {
  initialPricing?: VillaPricingWithVillaBooking;
}

export const CalendarManagementPage: React.FC<CalendarManagementPageProps> = ({
  initialPricing
}) => {
  // The calendar always opens on the current date; only the view mode is remembered
  const [viewMode, setViewMode] = useState<CalendarViewMode>(readSavedViewMode);
  const [focus, setFocus] = useState<CalendarFocus>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  // Changing this object makes the active view scroll to that month/year
  const [scrollTarget, setScrollTarget] = useState<CalendarScrollTarget>(() => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: viewMode === 'year' ? YEAR_VIEW_OPEN_MONTH : today.getMonth()
    };
  });
  const [yearRange, setYearRange] = useState(() => {
    const todayYear = new Date().getFullYear();
    return { start: todayYear - 1, end: todayYear + 2 };
  });
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

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

  const pricing = initialPricing || pricingData;

  // Selection handler
  const calendarIndex = useMemo(() => (pricing ? buildCalendarIndex(pricing) : null), [pricing]);

  const setOrderedRange = (a: Date, b: Date) => {
    const [start, end] = a <= b ? [a, b] : [b, a];
    setSelectedStartDate(start);
    setSelectedEndDate(end);
  };

  const handleDateSelect = (date: Date) => {
    if (!calendarIndex || !isDateSelectable(calendarIndex, date)) return;

    if (adjustmentMode) {
      // The opposite boundary stays fixed; swap automatically if the dates cross
      const fixedDate = adjustmentMode === 'start' ? selectedEndDate : selectedStartDate;
      if (fixedDate) {
        // Keep adjusting when the new range would cross a booked day
        if (!isRangeSelectable(calendarIndex, date, fixedDate)) return;
        setOrderedRange(date, fixedDate);
      } else if (adjustmentMode === 'start') {
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      setAdjustmentMode(null);
      return;
    }

    const isCompletingSelection =
      selectedStartDate &&
      !selectedEndDate &&
      date >= selectedStartDate &&
      isRangeSelectable(calendarIndex, selectedStartDate, date);
    if (isCompletingSelection) {
      setSelectedEndDate(date);
      return;
    }

    // Start a new selection
    setSelectedStartDate(date);
    setSelectedEndDate(null);
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

  const showPriceCheck = (check: Extract<PriceCheck, { ok: false }>) => {
    if (check.reformat) {
      // Update the input field to show the correct format
      setPriceAmount(check.reformat);
    }
    notification[check.level]({ message: check.message });
  };

  // Handle pricing range update
  const handleSavePricingRange = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      notification.warning({ message: 'Please select a date range first' });
      return;
    }

    const priceCheck: PriceCheck =
      selectedAction === 'ADD' ? checkPriceAmount(priceAmount, priceCurrency) : { ok: true };
    if (!priceCheck.ok) {
      showPriceCheck(priceCheck);
      return;
    }

    if (!user) {
      notification.error({ message: 'User not authenticated' });
      return;
    }

    // Get villa ID from authenticated user
    const villaId = (user as any).villa?.id;
    if (!villaId) {
      notification.error({ message: 'No villa associated with this user' });
      return;
    }

    setIsSaving(true);

    try {
      const payload: Update_PricingRange_WC_MLS_XAction = {
        action: selectedAction,
        startperiod: formatDateToYYYYMMDD(selectedStartDate),
        endperiod: formatDateToYYYYMMDD(selectedEndDate),
        pricepernight: {
          amount: selectedAction === 'ADD' ? Number.parseFloat(priceAmount).toFixed(2) : priceAmount,
          currency: priceCurrency
        }
      };

      await api.put(`/villas/${villaId}/pricing-schema/pricing-ranges`, payload);

      // Invalidate pricing query to refetch updated data
      await queryClient.invalidateQueries({ queryKey: ['current-villa-pricing'] });
      
      notification.success({ message: 'Pricing range updated successfully!' });
      clearSelection();
      setPriceAmount('');

    } catch (error) {
      console.error('Error updating pricing range:', error);
      notification.error({ message: 'Failed to update pricing range. Please try again.' });
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
    if (!calendarIndex || !isDateSelectable(calendarIndex, date)) return;
    setIsDragging(true);
    setDragStartDate(date);
    setSelectedStartDate(date);
    setSelectedEndDate(null);
    setAdjustmentMode(null);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate && calendarIndex) {
      // Stop extending at the first booked day instead of selecting across it
      setOrderedRange(dragStartDate, clampSelectionEnd(calendarIndex, dragStartDate, date));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
  };

  // Global mouse up event listener to handle drag ending outside calendar
  // This ensures drag selection works across both calendar months
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

  // Pre-fill amount based on selected date range pricing
  useEffect(() => {
    if (!selectedStartDate) return;

    const endDate = selectedEndDate || selectedStartDate;
    const pricingRanges = pricing?.pricing?.pricingranges ?? [];

    const priceKeys = new Set<string>();
    let lastPrice: { amount: string; currency: string } | null = null;

    const current = new Date(selectedStartDate);
    const end = new Date(endDate);
    while (current <= end) {
      const y = current.getFullYear();
      const m = (current.getMonth() + 1).toString().padStart(2, '0');
      const d = current.getDate().toString().padStart(2, '0');
      const dateStr = `${y}${m}${d}`;
      const range = pricingRanges.find(
        r => r.startperiod <= dateStr && r.endperiod >= dateStr
      );
      if (range) {
        priceKeys.add(`${range.pricepernight.amount}:${range.pricepernight.currency}`);
        lastPrice = range.pricepernight;
      }
      current.setDate(current.getDate() + 1);
    }

    if (priceKeys.size === 1 && lastPrice) {
      setPriceAmount(lastPrice.amount.replace(',', '.'));
      setPriceCurrency(lastPrice.currency);
    } else {
      setPriceAmount('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStartDate, selectedEndDate, pricing]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  // Navigation
  const navigateTo = useCallback((target: CalendarFocus) => {
    setYearRange(range => ({
      start: Math.min(range.start, target.year),
      end: Math.max(range.end, target.year + 1)
    }));
    setFocus(target);
    setScrollTarget({ ...target });
  }, []);

  const changeViewMode = (mode: CalendarViewMode) => {
    setViewMode(mode);
    setScrollTarget({ ...focus });
  };

  const handleFocusChange = useCallback(
    (year: number, month: number) => {
      setFocus(prev => {
        if (viewMode === 'year') return prev.year === year ? prev : { year, month: 0 };
        return prev.year === year && prev.month === month ? prev : { year, month };
      });
    },
    [viewMode]
  );

  const handleNearEnd = useCallback(() => {
    setYearRange(range => ({ ...range, end: range.end + 1 }));
  }, []);

  const handleMonthOpen = useCallback(
    (year: number, month: number) => {
      setViewMode('month');
      navigateTo({ year, month });
    },
    [navigateTo]
  );

  // Month cells are memoized, so the selection callbacks handed to the views must keep a
  // stable identity while always running the latest handler
  const latestHandlers = useRef({
    handleDateSelect,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleStartDateAdjust,
    handleEndDateAdjust
  });
  useLayoutEffect(() => {
    latestHandlers.current = {
      handleDateSelect,
      handleMouseDown,
      handleMouseEnter,
      handleMouseUp,
      handleStartDateAdjust,
      handleEndDateAdjust
    };
  });
  const stableHandlers = useMemo(
    () => ({
      onDateSelect: (date: Date) => latestHandlers.current.handleDateSelect(date),
      onMouseDown: (date: Date) => latestHandlers.current.handleMouseDown(date),
      onMouseEnter: (date: Date) => latestHandlers.current.handleMouseEnter(date),
      onMouseUp: () => latestHandlers.current.handleMouseUp(),
      onStartDateAdjust: (date: Date) => latestHandlers.current.handleStartDateAdjust(date),
      onEndDateAdjust: (date: Date) => latestHandlers.current.handleEndDateAdjust(date)
    }),
    []
  );

  // Keyboard shortcuts
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => {});
  useLayoutEffect(() => {
    keyHandlerRef.current = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || shortcutsOpen) return;
      const target = event.target as HTMLElement | null;
      const isTextEntry =
        target?.isContentEditable ||
        ['TEXTAREA', 'SELECT'].includes(target?.tagName ?? '') ||
        (target instanceof HTMLInputElement && !['radio', 'checkbox', 'button'].includes(target.type));
      if (isTextEntry) return;

      const today = new Date();
      switch (event.key) {
        case 'l':
        case 'L':
          changeViewMode('list');
          break;
        case 'm':
        case 'M':
          changeViewMode('month');
          break;
        case 'y':
        case 'Y':
          changeViewMode('year');
          break;
        case 't':
        case 'T':
          navigateTo({ year: today.getFullYear(), month: today.getMonth() });
          break;
        case '[':
          navigateTo(
            viewMode === 'year' ? { year: focus.year - 1, month: focus.month } : addMonths(focus, -1)
          );
          break;
        case ']':
          navigateTo(
            viewMode === 'year' ? { year: focus.year + 1, month: focus.month } : addMonths(focus, 1)
          );
          break;
        case 'Escape':
          clearSelection();
          break;
        case '?':
          setShortcutsOpen(true);
          break;
        default:
          return;
      }
      event.preventDefault();
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div className={styles.div3}>Loading calendar data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !initialPricing) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div className={styles.div4}>
            Error: {error?.message || 'Failed to load pricing data'}
          </div>
        </div>
      </div>
    );
  }

  if (!pricing || !calendarIndex) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div className={styles.div3}>No pricing data available</div>
        </div>
      </div>
    );
  }

  const headerTitle =
    viewMode === 'year' ? `${focus.year}` : `${MONTH_NAMES[focus.month]} ${focus.year}`;
  const ActiveView =
    viewMode === 'list' ? CalendarListView : viewMode === 'year' ? CalendarYearView : CalendarMonthsView;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Left side - Calendar header and scrollable calendar */}
        <div className={styles.calendarPane}>
          <CalendarHeader
            title={headerTitle}
            viewMode={viewMode}
            onViewModeChange={changeViewMode}
            onToday={() => navigateTo({ year: new Date().getFullYear(), month: new Date().getMonth() })}
            shortcutsOpen={shortcutsOpen}
            onShortcutsOpenChange={setShortcutsOpen}
          />
          <ActiveView
            index={calendarIndex}
            startYear={yearRange.start}
            endYear={yearRange.end}
            scrollTarget={scrollTarget}
            onFocusChange={handleFocusChange}
            onNearEnd={handleNearEnd}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            isDragging={isDragging}
            onMonthOpen={handleMonthOpen}
            {...stableHandlers}
          />
        </div>

        {/* Right side - Operations Section (20%) */}
        <div className={styles.div11}>
          <div className={styles.div12}>
            <h3 className={styles.h33}>Operations</h3>

            {/* Selection Info */}
            {(selectedStartDate || selectedEndDate || isDragging) && (
              <div className={styles.div13}>
                <h4 className={styles.h4}>Selected Period</h4>
                {isDragging && (
                  <div className={styles.div14}>
                    Dragging to select range...
                  </div>
                )}
                {adjustmentMode && !isDragging && (
                  <div className={styles.div15}>
                    Adjusting {adjustmentMode} date - click a new date
                  </div>
                )}
                <div className={styles.div16}>
                  <div>Start: {selectedStartDate?.toLocaleDateString() || 'Not selected'}</div>
                  <div>End: {selectedEndDate?.toLocaleDateString() || 'Not selected'}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={styles.button2}
                  onClick={clearSelection}
                  disabled={isDragging}
                >
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Pricing Operations */}
            {selectedStartDate && selectedEndDate && !isDragging && !adjustmentMode && (
              <div className={styles.div17}>
                <h4 className={styles.h42}>Pricing Operations</h4>

                {/* Action Selection */}
                <div className={styles.div18}>
                  <div id="pricing-action-label" className={styles.label}>Action</div>
                  <div className={styles.div19} role="radiogroup" aria-labelledby="pricing-action-label">
                    <label className={styles.label2}>
                      <input
                        type="radio"
                        name="action"
                        value="ADD"
                        checked={selectedAction === 'ADD'}
                        onChange={(e) => setSelectedAction(e.target.value as UpdatePricingRangeAction)}
                        className={styles.input}
                      />
                      <span>Open</span>                    </label>
                    <label className={styles.label2}>
                      <input
                        type="radio"
                        name="action"
                        value="DELETE"
                        checked={selectedAction === 'DELETE'}
                        onChange={(e) => setSelectedAction(e.target.value as UpdatePricingRangeAction)}
                        className={styles.input}
                      />
                      <span>Close</span>                    </label>
                  </div>
                </div>

                {/* Price Input (only for ADD action) */}
                {selectedAction === 'ADD' && (
                  <div className={styles.div20}>
                    <div>
                      <label htmlFor="pricing-amount" className={styles.label3}>Amount</label>
                      <input
                        id="pricing-amount"
                        type="text"
                        inputMode="decimal"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        placeholder="150.00"
                        className={styles.input2}
                      />
                      <div className={styles.div21}>Format: 150.00</div>
                    </div>
                    <div>
                      <label htmlFor="pricing-currency" className={styles.label3}>Currency</label>
                      <select
                        id="pricing-currency"
                        value={priceCurrency}
                        onChange={(e) => setPriceCurrency(e.target.value)}
                        className={styles.input2}
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
                  className={styles.button3}
                  onClick={handleSavePricingRange}
                  disabled={isSaving || (selectedAction === 'ADD' && (!priceAmount || !priceCurrency))}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}

            {/* Other Operations */}
            <div className={styles.div22}>
              <Button variant="outline" size="sm" className={styles.button4}>
                View Bookings
              </Button>
              <Button variant="outline" size="sm" className={styles.button4}>
                Export Calendar
              </Button>
            </div>

            {/* Legend */}
            {/* <div className="mt-6 pt-4 border-t border-gray-200">
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
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};