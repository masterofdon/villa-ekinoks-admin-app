'use client';

import React, { useMemo } from 'react';
import {
  arePropsEqualForMonth,
  CalendarIndex,
  getDaysInMonth,
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

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MonthSectionProps = {
  year: number;
  month: number;
  days: Date[];
  index: CalendarIndex;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onMouseUp: () => void;
};

const ListMonthSection = React.memo(function ListMonthSection({
  year,
  month,
  days,
  index,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}: MonthSectionProps) {
  const today = new Date();

  return (
    <section data-month-key={monthKey(year, month)}>
      <h3 className={styles.listMonthHeader}>
        {MONTH_NAMES[month]} {year}
      </h3>
      {days.map(date => {
        const info = index.getDayInfo(date);
        const isSelected = isDateInSelection(date, selectedStartDate, selectedEndDate);
        const isCheckout = !info.isBooked && !!info.bannerBooking;
        const dayName = WEEKDAY_SHORT[date.getDay()];
        const isPast = isDatePast(date);
        const isUnselectable = isPast || info.isBooked;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        let status: React.ReactNode;
        let statusClass = styles.listStatusAvailable;
        if (info.isClosed) {
          status = 'Closed';
          statusClass = styles.listStatusClosed;
        } else if (info.isBooked) {
          status = `Booked · ${getGuestName(info.booking)}`;
          statusClass = styles.listStatusBooked;
        } else if (isCheckout) {
          status = `Checkout · ${getGuestName(info.bannerBooking)}`;
          statusClass = styles.listStatusBooked;
        } else {
          status = 'Available';
        }

        return (
          <div
            key={date.getDate()}
            className={[
              styles.listRow,
              isSelected ? styles.selected : '',
              isWeekend ? styles.listRowWeekend : '',
              isUnselectable ? styles.unselectable : '',
              isPast ? styles.past : ''
            ].join(' ')}
            onClick={() => onDateSelect(date)}
            onMouseDown={() => onMouseDown(date)}
            onMouseEnter={() => onMouseEnter(date)}
            onMouseUp={onMouseUp}
          >
            <div className={styles.listDate}>
              <span className={styles.listWeekday}>{dayName}</span>
              <span className={isSameDay(date, today) ? styles.listDayToday : styles.listDay}>
                {date.getDate()}
              </span>
            </div>
            <div className={`${styles.listStatus} ${statusClass}`}>{status}</div>
            <div className={styles.listPrice}>
              {!info.isClosed && !info.isBooked && info.price
                ? `${info.price.amount} ${info.price.currency}`
                : ''}
            </div>
          </div>
        );
      })}
    </section>
  );
}, (prev, next) => arePropsEqualForMonth(prev, next, next.year, next.month));

export const CalendarListView = React.memo(function CalendarListView({
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
  onMouseUp
}: CalendarViewProps) {
  const { containerRef, handleScroll } = useMonthScroll({
    scrollTarget,
    granularity: 'month',
    onFocusChange,
    onNearEnd
  });

  const months = useMemo(() => {
    const result: { year: number; month: number; days: Date[] }[] = [];
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const days = Array.from(
          { length: getDaysInMonth(year, month) },
          (_, i) => new Date(year, month, i + 1)
        );
        result.push({ year, month, days });
      }
    }
    return result;
  }, [startYear, endYear]);

  return (
    <div ref={containerRef} className={styles.scroller} onScroll={handleScroll}>
      <div className={styles.listColumn}>
        {months.map(({ year, month, days }) => (
          <ListMonthSection
            key={monthKey(year, month)}
            year={year}
            month={month}
            days={days}
            index={index}
            selectedStartDate={selectedStartDate}
            selectedEndDate={selectedEndDate}
            onDateSelect={onDateSelect}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
          />
        ))}
      </div>
    </div>
  );
});
