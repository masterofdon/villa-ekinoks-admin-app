import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { monthKey } from '@/lib/calendar-utils';
import type { CalendarScrollTarget } from './calendarViewTypes';

// A section counts as focused once its top passes this offset from the container top
const FOCUS_OFFSET_PX = 120;
const NEAR_END_PX = 1500;

interface UseMonthScrollOptions {
  scrollTarget: CalendarScrollTarget;
  // Year views only have one section per year (keyed as month 0)
  granularity: 'month' | 'year';
  onFocusChange: (year: number, month: number) => void;
  onNearEnd: () => void;
}

/**
 * Scroll container behaviour shared by all calendar views. Sections must carry a
 * `data-month-key` attribute (see monthKey). Reports the section currently in focus
 * while scrolling and scrolls to `scrollTarget` on mount and whenever it changes.
 */
export const useMonthScroll = ({
  scrollTarget,
  granularity,
  onFocusChange,
  onNearEnd
}: UseMonthScrollOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const callbacksRef = useRef({ onFocusChange, onNearEnd });

  useEffect(() => {
    callbacksRef.current = { onFocusChange, onNearEnd };
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Year views anchor on the row of months (data-scroll-key) containing the target month
    const section =
      (granularity === 'year'
        ? container.querySelector<HTMLElement>(
            `[data-scroll-key="${monthKey(scrollTarget.year, scrollTarget.month - (scrollTarget.month % 3))}"]`
          )
        : null) ??
      container.querySelector<HTMLElement>(
        `[data-month-key="${monthKey(scrollTarget.year, granularity === 'year' ? 0 : scrollTarget.month)}"]`
      );
    if (!section) return;
    container.scrollTop +=
      section.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }, [scrollTarget, granularity]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleScroll = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const container = containerRef.current;
      if (!container) return;

      const threshold = container.getBoundingClientRect().top + FOCUS_OFFSET_PX;
      let focusedKey: string | undefined;
      for (const section of container.querySelectorAll<HTMLElement>('[data-month-key]')) {
        if (section.getBoundingClientRect().top > threshold) break;
        focusedKey = section.dataset.monthKey;
      }
      if (focusedKey) {
        const [year, month] = focusedKey.split('-').map(Number);
        callbacksRef.current.onFocusChange(year, month);
      }

      const remaining = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (remaining < NEAR_END_PX) callbacksRef.current.onNearEnd();
    });
  }, []);

  return { containerRef, handleScroll };
};
