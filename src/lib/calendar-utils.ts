import type { Price, SimpleVillaBooking, VillaPricingWithVillaBooking } from '@/types';
import { formatToYYYYMMDD, parseYYYYMMDD } from '@/lib/date-utils';

export type CalendarViewMode = 'list' | 'month' | 'year';

export type CalendarFocus = { year: number; month: number };

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Identifies a scroll section; year sections use month 0
export const monthKey = (year: number, month: number) => `${year}-${month}`;

export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

// Monday-first weekday offset of the 1st of the month (Mon = 0)
export const getFirstWeekdayOffset = (year: number, month: number) =>
  (new Date(year, month, 1).getDay() + 6) % 7;

export const addMonths = (focus: CalendarFocus, delta: number): CalendarFocus => {
  const total = focus.year * 12 + focus.month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
};

export type DayInfo = {
  // Booking occupying the night (check-in inclusive, checkout day exclusive)
  booking?: SimpleVillaBooking;
  // Booking to draw a banner for (includes the checkout day)
  bannerBooking?: SimpleVillaBooking;
  price?: Price;
  isBooked: boolean;
  isClosed: boolean;
};

export type CalendarIndex = {
  getDayInfo: (date: Date) => DayInfo;
};

const forEachDay = (
  startStr: string,
  endStr: string,
  inclusiveEnd: boolean,
  visit: (key: string) => void
) => {
  const start = parseYYYYMMDD(startStr);
  const end = parseYYYYMMDD(endStr);
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (inclusiveEnd ? current <= last : current < last) {
    visit(formatToYYYYMMDD(current));
    current.setDate(current.getDate() + 1);
  }
};

// Day lookups are indexed once per pricing payload; the first matching booking/range wins
export const buildCalendarIndex = (pricing: VillaPricingWithVillaBooking): CalendarIndex => {
  const booked = new Map<string, SimpleVillaBooking>();
  const banners = new Map<string, SimpleVillaBooking>();
  const prices = new Map<string, Price>();

  for (const booking of pricing.bookings) {
    forEachDay(booking.startdate, booking.enddate, false, key => {
      if (!booked.has(key)) booked.set(key, booking);
    });
    forEachDay(booking.startdate, booking.enddate, true, key => {
      if (!banners.has(key)) banners.set(key, booking);
    });
  }

  for (const range of pricing.pricing.pricingranges) {
    forEachDay(range.startperiod, range.endperiod, true, key => {
      if (!prices.has(key)) prices.set(key, range.pricepernight);
    });
  }

  // Cached so memoized rows/cells receive referentially stable info objects
  const cache = new Map<string, DayInfo>();

  return {
    getDayInfo: (date: Date) => {
      const key = formatToYYYYMMDD(date);
      let info = cache.get(key);
      if (!info) {
        const booking = booked.get(key);
        const price = prices.get(key);
        info = {
          booking,
          bannerBooking: banners.get(key),
          price,
          isBooked: !!booking,
          isClosed: !booking && !price
        };
        cache.set(key, info);
      }
      return info;
    }
  };
};

export const getGuestName = (booking?: SimpleVillaBooking) =>
  booking
    ? `${booking.inquiror.personalinfo.firstname} ${booking.inquiror.personalinfo.lastname}`
    : '';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const isDateInSelection = (
  date: Date,
  start?: Date | null,
  end?: Date | null
) => {
  if (!start) return false;
  const day = startOfDay(date).getTime();
  const from = startOfDay(start).getTime();
  const to = end ? startOfDay(end).getTime() : from;
  return day >= from && day <= to;
};

export const isDatePast = (date: Date) => startOfDay(date) < startOfDay(new Date());

// Past days and already booked nights can't be selected (closed days can, to reopen them)
export const isDateSelectable = (index: CalendarIndex, date: Date) =>
  !isDatePast(date) && !index.getDayInfo(date).isBooked;

const stepDay = (date: Date, step: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + step);

/**
 * Walks from `from` towards `to` and returns the furthest date reachable
 * without crossing an unselectable day.
 */
export const clampSelectionEnd = (index: CalendarIndex, from: Date, to: Date) => {
  const step = to >= from ? 1 : -1;
  let last = from;
  for (let day = from; step > 0 ? day <= to : day >= to; day = stepDay(day, step)) {
    if (!isDateSelectable(index, day)) break;
    last = day;
  }
  return last;
};

export const isRangeSelectable = (index: CalendarIndex, a: Date, b: Date) =>
  isSameDay(clampSelectionEnd(index, a, b), b) && isDateSelectable(index, a);

const selectionTouchesMonth = (
  start: Date | null | undefined,
  end: Date | null | undefined,
  year: number,
  month: number
) => {
  if (!start) return false;
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return start.getTime() <= monthEnd && (end ?? start).getTime() >= monthStart;
};

const sameTime = (a?: Date | null, b?: Date | null) => (a?.getTime() ?? null) === (b?.getTime() ?? null);

type MonthSelectionProps = {
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
};

/**
 * React.memo comparator: shallow-compares every prop, but ignores selection changes
 * that don't touch the given month so only affected months re-render while dragging.
 * Callback props must therefore be referentially stable.
 */
export const arePropsEqualForMonth = <P extends MonthSelectionProps>(
  prev: P,
  next: P,
  year: number,
  month: number
) => {
  const prevRecord = prev as Record<string, unknown>;
  const nextRecord = next as Record<string, unknown>;
  const keys = new Set([...Object.keys(prevRecord), ...Object.keys(nextRecord)]);
  for (const key of keys) {
    if (key === 'selectedStartDate' || key === 'selectedEndDate') continue;
    if (prevRecord[key] !== nextRecord[key]) return false;
  }

  const touchesMonth =
    selectionTouchesMonth(prev.selectedStartDate, prev.selectedEndDate, year, month) ||
    selectionTouchesMonth(next.selectedStartDate, next.selectedEndDate, year, month);
  if (!touchesMonth) return true;

  return (
    sameTime(prev.selectedStartDate, next.selectedStartDate) &&
    sameTime(prev.selectedEndDate, next.selectedEndDate)
  );
};
