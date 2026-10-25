import type { CalendarFocus, CalendarIndex } from '@/lib/calendar-utils';

export type CalendarScrollTarget = CalendarFocus;

export interface CalendarViewProps {
  index: CalendarIndex;
  startYear: number;
  endYear: number;
  // A new object requests a programmatic scroll to that month/year
  scrollTarget: CalendarScrollTarget;
  onFocusChange: (year: number, month: number) => void;
  onNearEnd: () => void;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  isDragging: boolean;
  onDateSelect: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onMouseUp: () => void;
  onStartDateAdjust: (date: Date) => void;
  onEndDateAdjust: (date: Date) => void;
  onMonthOpen: (year: number, month: number) => void;
}
