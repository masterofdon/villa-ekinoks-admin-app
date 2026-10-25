'use client';

import React from 'react';
import { Modal, Segmented } from 'antd';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CalendarViewMode } from '@/lib/calendar-utils';
import styles from './CalendarHeader.module.css';

export const CALENDAR_SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['L'], description: 'List view' },
  { keys: ['M'], description: 'Month view' },
  { keys: ['Y'], description: 'Year view' },
  { keys: ['T'], description: 'Jump to today' },
  { keys: ['['], description: 'Previous month (previous year in year view)' },
  { keys: [']'], description: 'Next month (next year in year view)' },
  { keys: ['Esc'], description: 'Clear the selected period' },
  { keys: ['?'], description: 'Show keyboard shortcuts' }
];

const VIEW_OPTIONS: { label: string; value: CalendarViewMode }[] = [
  { label: 'List', value: 'list' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

interface CalendarHeaderProps {
  title: string;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  viewMode,
  onViewModeChange,
  onToday,
  shortcutsOpen,
  onShortcutsOpenChange
}) => {
  return (
    <header className={styles.header}>
      <h2 className={styles.title} aria-live="polite">
        {title}
      </h2>

      <div className={styles.controls}>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Segmented<CalendarViewMode>
          options={VIEW_OPTIONS}
          value={viewMode}
          onChange={onViewModeChange}
        />
        <button
          type="button"
          className={styles.shortcutsButton}
          onClick={() => onShortcutsOpenChange(true)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard size={18} aria-hidden="true" />
        </button>
      </div>

      <Modal
        title="Keyboard shortcuts"
        open={shortcutsOpen}
        onCancel={() => onShortcutsOpenChange(false)}
        footer={null}
        width={420}
      >
        <ul className={styles.shortcutList}>
          {CALENDAR_SHORTCUTS.map(shortcut => (
            <li key={shortcut.description} className={styles.shortcutRow}>
              <span>{shortcut.description}</span>
              <span>
                {shortcut.keys.map(key => (
                  <kbd key={key} className={styles.key}>
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </header>
  );
};
