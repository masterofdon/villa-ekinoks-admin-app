'use client';

import React, { useRef } from 'react';
import styles from './OtpInput.module.css';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (index: number) => {
    inputs.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
  };

  const fillAll = (code: string) => {
    onChange(code);
    focusAt(length - 1);
  };

  const handleChange = (index: number, raw: string) => {
    // A full code arriving in one go (browser/OS autofill) fills every box.
    if (raw.length === length && /^\d+$/.test(raw)) {
      fillAll(raw);
      return;
    }
    // Typing over an already filled box (selection lost) yields two digits; keep the new one.
    const digit = digits[index] && /^\d\d$/.test(raw) ? raw.replace(digits[index], '') : raw;
    // Anything else must be a single digit; letters, symbols and partial strings are dropped.
    if (!/^\d$/.test(digit)) return;
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
    focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        focusAt(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    // Only an exact numeric code of the expected length is accepted.
    if (pasted.length === length && /^\d+$/.test(pasted)) {
      fillAll(pasted);
    }
  };

  return (
    <div className={styles.div} role="group" aria-label="Verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={styles.input}
        />
      ))}
    </div>
  );
}
