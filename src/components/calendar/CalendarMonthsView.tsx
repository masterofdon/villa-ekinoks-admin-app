'use client';

import React, { useMemo } from 'react';
import { CalendarMonthViewComponent } from '@/components/calendar/CalendarMonthViewComponent';
import { MONTH_NAMES, monthKey } from '@/lib/calendar-utils';
import type { CalendarViewProps } from './calendarViewTypes';
import { useMonthScroll } from './useMonthScroll';
import styles from './CalendarViews.module.css';

const getPeriodString = (month: number, year: number) =>
  `${(month + 1).toString().padStart(2, '0')}${year}`;

export const CalendarMonthsView = React.memo(function CalendarMonthsView({
  index,
  startYear,
  endYear,
  scrollTarget,
  onFocusChange,
  onNearEnd,
  selectedStartDate,
  selectedEndDate,
  isDragging,
  onDateSelect,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onStartDateAdjust,
  onEndDateAdjust
}: CalendarViewProps) {
  const { containerRef, handleScroll } = useMonthScroll({
    scrollTarget,
    granularity: 'month',
    onFocusChange,
    onNearEnd
  });

  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) result.push({ year, month });
    }
    return result;
  }, [startYear, endYear]);

  return (
    <div ref={containerRef} className={styles.scroller} onScroll={handleScroll}>
      <div className={styles.monthsColumn}>
        {months.map(({ year, month }) => (
          <section
            key={monthKey(year, month)}
            data-month-key={monthKey(year, month)}
            className={styles.monthSection}
          >
            <h3 className={styles.monthTitle}>
              {MONTH_NAMES[month]} {year}
            </h3>
            <CalendarMonthViewComponent
              period={getPeriodString(month, year)}
              index={index}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onDateSelect={onDateSelect}
              onStartDateAdjust={onStartDateAdjust}
              onEndDateAdjust={onEndDateAdjust}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onMouseUp={onMouseUp}
              isDragging={isDragging}
            />
          </section>
        ))}
      </div>
    </div>
  );
});
