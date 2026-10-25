'use client';

import React, { useMemo } from 'react';
import {
  arePropsEqualForMonth,
  CalendarIndex,
  getDaysInMonth,
  getFirstWeekdayOffset,
  getGuestName,
  isDateInSelection,
  isDatePast,
  isSameDay,
  MONTH_NAMES,
  monthKey
} from '@/lib/calendar-utils';
import type { CalendarViewProps } from './calendarViewTypes';
import { useMonthScroll } from './useMonthScroll';
import styles from './CalendarViews.module.css';

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type MiniMonthProps = {
  year: number;
  month: number;
  index: CalendarIndex;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onMouseUp: () => void;
  onMonthOpen: (year: number, month: number) => void;
};

// Compact amount for the small cells; the currency is available in the cell tooltip
const formatCompactPrice = (amount: string) => {
  const value = Number(amount.replace(',', '.'));
  if (Number.isNaN(value)) return amount;
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

const getDayTitle = (info: ReturnType<CalendarIndex['getDayInfo']>) => {
  if (info.isClosed) return 'Closed';
  if (info.isBooked) return `Booked by ${getGuestName(info.booking)}`;
  const checkout = info.bannerBooking ? `Checkout by ${getGuestName(info.bannerBooking)}. ` : '';
  return info.price ? `${checkout}${info.price.amount} ${info.price.currency}` : checkout;
};

const MiniMonth = React.memo(function MiniMonth({
  year,
  month,
  index,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMonthOpen
}: MiniMonthProps) {
  const today = new Date();
  const leadingBlanks = getFirstWeekdayOffset(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  return (
    <div
      className={styles.miniMonth}
      data-scroll-key={month % 3 === 0 ? monthKey(year, month) : undefined}
    >
      <button
        type="button"
        className={styles.miniMonthTitle}
        onClick={() => onMonthOpen(year, month)}
        title={`Open ${MONTH_NAMES[month]} ${year} in month view`}
      >
        {MONTH_NAMES[month]}
      </button>
      <div className={styles.miniGrid}>
        {WEEKDAY_INITIALS.map((initial, i) => (
          <div key={i} className={styles.miniWeekday}>
            {initial}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const info = index.getDayInfo(date);
          const classes = [styles.miniDay];
          if (isDateInSelection(date, selectedStartDate, selectedEndDate)) classes.push(styles.selected);
          else if (info.isClosed) classes.push(styles.miniDayClosed);
          else if (info.isBooked) classes.push(styles.miniDayBooked);
          if (isSameDay(date, today)) classes.push(styles.miniDayToday);
          if (isDatePast(date) || info.isBooked) classes.push(styles.unselectable);
          if (isDatePast(date)) classes.push(styles.past);

          return (
            <div
              key={i}
              className={classes.join(' ')}
              title={getDayTitle(info)}
              onClick={() => onDateSelect(date)}
              onMouseDown={() => onMouseDown(date)}
              onMouseEnter={() => onMouseEnter(date)}
              onMouseUp={onMouseUp}
            >
              <span>{i + 1}</span>
              {!info.isClosed && !info.isBooked && info.price && (
                <span className={styles.miniDayPrice}>{formatCompactPrice(info.price.amount)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => arePropsEqualForMonth(prev, next, next.year, next.month));

export const CalendarYearView = React.memo(function CalendarYearView({
  index,
  startYear,
  endYear,
  scrollTarget,
  onFocusChange,
  onNearEnd,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMonthOpen
}: CalendarViewProps) {
  const { containerRef, handleScroll } = useMonthScroll({
    scrollTarget,
    granularity: 'year',
    onFocusChange,
    onNearEnd
  });

  const years = useMemo(
    () => Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    [startYear, endYear]
  );

  return (
    <div ref={containerRef} className={styles.scroller} onScroll={handleScroll}>
      <div className={styles.yearsColumn}>
        {years.map(year => (
          <section key={year} data-month-key={monthKey(year, 0)} className={styles.yearSection}>
            <h3 className={styles.yearTitle}>{year}</h3>
            <div className={styles.yearGrid}>
              {Array.from({ length: 12 }, (_, month) => (
                <MiniMonth
                  key={month}
                  year={year}
                  month={month}
                  index={index}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  onDateSelect={onDateSelect}
                  onMouseDown={onMouseDown}
                  onMouseEnter={onMouseEnter}
                  onMouseUp={onMouseUp}
                  onMonthOpen={onMonthOpen}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
});
