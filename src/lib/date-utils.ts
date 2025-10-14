/**
 * Date utilities for villa booking system
 */

/**
 * Parse YYYYMMDD format to Date object
 * @param dateStr - Date string in YYYYMMDD format (e.g., "20251015")
 * @returns Date object
 */
export const parseYYYYMMDD = (dateStr: string): Date => {
  if (!dateStr || dateStr.length !== 8) {
    console.error('Invalid date format:', dateStr, 'Expected YYYYMMDD format');
    return new Date();
  }
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed in JavaScript
  const day = parseInt(dateStr.substring(6, 8));
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('Invalid date components:', { year, month: month + 1, day }, 'from', dateStr);
    return new Date();
  }
  
  return new Date(year, month, day);
};

/**
 * Format Date object to YYYYMMDD string
 * @param date - Date object
 * @returns Date string in YYYYMMDD format
 */
export const formatToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
};

/**
 * Check if a date is within booking period (includes check-in date, excludes checkout date)
 * @param checkDate - Date to check
 * @param startDateStr - Start date in YYYYMMDD format (check-in date)
 * @param endDateStr - End date in YYYYMMDD format (checkout date - excluded)
 * @returns boolean
 */
export const isDateInRange = (checkDate: Date, startDateStr: string, endDateStr: string): boolean => {
  const startDate = parseYYYYMMDD(startDateStr);
  const endDate = parseYYYYMMDD(endDateStr);
  
  // Normalize all dates to midnight for comparison
  const normalizedCheck = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  // Include start date (check-in) but exclude end date (checkout)
  return normalizedCheck >= normalizedStart && normalizedCheck < normalizedEnd;
};

/**
 * Get booking position information for banner display (includes checkout day)
 * @param checkDate - Date to check
 * @param startDateStr - Booking start date in YYYYMMDD format (check-in)
 * @param endDateStr - Booking end date in YYYYMMDD format (checkout)
 * @returns Object with position flags for banner display
 */
export const getBookingPosition = (checkDate: Date, startDateStr: string, endDateStr: string) => {
  const startDate = parseYYYYMMDD(startDateStr);
  const endDate = parseYYYYMMDD(endDateStr);
  
  const normalizedCheck = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  // For banner display, include both check-in and checkout dates
  if (normalizedCheck < normalizedStart || normalizedCheck > normalizedEnd) {
    return { isStart: false, isEnd: false, isMiddle: false };
  }
  
  const isStart = normalizedCheck.getTime() === normalizedStart.getTime();
  const isEnd = normalizedCheck.getTime() === normalizedEnd.getTime();
  const isMiddle = !isStart && !isEnd;
  
  return { isStart, isEnd, isMiddle };
};

/**
 * Format YYYYMMDD date string to human-readable format
 * @param dateStr - Date string in YYYYMMDD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDisplayDate = (
  dateStr: string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  const date = parseYYYYMMDD(dateStr);
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format timestamp to human-readable date and time
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date time string
 */
export const formatDateTime = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(timestamp));
};

/**
 * Convert HTML date input value to YYYYMMDD format
 * @param htmlDateValue - Date value from HTML input (YYYY-MM-DD)
 * @returns Date string in YYYYMMDD format
 */
export const htmlDateToYYYYMMDD = (htmlDateValue: string): string => {
  if (!htmlDateValue) return '';
  return htmlDateValue.replace(/-/g, '');
};

/**
 * Convert YYYYMMDD format to HTML date input value
 * @param yyyymmdd - Date string in YYYYMMDD format
 * @returns Date string in YYYY-MM-DD format for HTML input
 */
export const yyyymmddToHtmlDate = (yyyymmdd: string): string => {
  if (!yyyymmdd || yyyymmdd.length !== 8) return '';
  return `${yyyymmdd.substring(0, 4)}-${yyyymmdd.substring(4, 6)}-${yyyymmdd.substring(6, 8)}`;
};