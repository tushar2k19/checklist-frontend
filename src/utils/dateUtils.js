/**
 * Date utility functions for IST (Indian Standard Time)
 * All date operations in the frontend should use these utilities
 * to ensure consistent IST timezone handling throughout the application.
 */

// IST timezone constant
const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert a date string or Date object to IST
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {Date} - Date object in IST
 */
export function toIST(dateInput) {
  if (!dateInput) return null;
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Get the date in IST by using toLocaleString with IST timezone
  // and then parsing it back
  const istString = date.toLocaleString('en-US', { timeZone: IST_TIMEZONE });
  return new Date(istString);
}

/**
 * Format date in IST with full date and time
 * @param {string|Date} dateInput - ISO date string or Date object
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string in IST
 */
export function formatDateIST(dateInput, options = {}) {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
    ...options
  };
  
  return date.toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Format date in IST (date only, no time)
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} - Formatted date string in IST
 */
export function formatDateOnlyIST(dateInput) {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: IST_TIMEZONE
  });
}

/**
 * Format time in IST (time only, no date)
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} - Formatted time string in IST
 */
export function formatTimeIST(dateInput) {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE
  });
}

/**
 * Format date and time in IST with custom format
 * @param {string|Date} dateInput - ISO date string or Date object
 * @param {string} format - Format type: 'short', 'medium', 'long', 'full'
 * @returns {string} - Formatted date string in IST
 */
export function formatDateTimeIST(dateInput, format = 'medium') {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  const formatOptions = {
    short: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: IST_TIMEZONE
    },
    medium: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: IST_TIMEZONE
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: IST_TIMEZONE
    },
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: IST_TIMEZONE
    }
  };
  
  return date.toLocaleDateString('en-IN', formatOptions[format] || formatOptions.medium);
}

/**
 * Get current date/time in IST
 * @returns {Date} - Current date in IST
 */
export function nowIST() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
}

/**
 * Format date for display in evaluation cards (compact format)
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} - Formatted date string
 */
export function formatEvaluationDate(dateInput) {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: IST_TIMEZONE
  });
}

/**
 * Format processing time (seconds to human readable)
 * @param {number} seconds - Processing time in seconds
 * @returns {string} - Formatted time string
 */
export function formatProcessingTime(seconds) {
  if (!seconds && seconds !== 0) return 'N/A';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get ISO string in IST
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} - ISO string adjusted for IST
 */
export function toISOStringIST(dateInput) {
  if (!dateInput) return '';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Convert to IST and return ISO string
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
  return istDate.toISOString();
}

