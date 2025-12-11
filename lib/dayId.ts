/**
 * Day ID utilities
 * Day ID format: YYYYMMDD (e.g., 20251211)
 */

/**
 * Get current day ID (UTC)
 * Can be overridden via NEXT_PUBLIC_TEST_DAY_ID env var for testing
 * 
 * Usage for testing:
 *   NEXT_PUBLIC_TEST_DAY_ID=20251213 npm run dev
 */
export function getCurrentDayId(): number {
  // Allow override for testing
  // NEXT_PUBLIC_ prefix makes it available in both server and client in Next.js
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TEST_DAY_ID) {
    const testDayId = parseInt(process.env.NEXT_PUBLIC_TEST_DAY_ID, 10);
    if (isValidDayId(testDayId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[TEST MODE] Using test dayId: ${testDayId}`);
      }
      return testDayId;
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn(`[TEST MODE] Invalid test dayId: ${process.env.NEXT_PUBLIC_TEST_DAY_ID}, using current day`);
    }
  }
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  
  return parseInt(`${year}${month}${day}`, 10);
}

/**
 * Get day ID for a specific date
 */
export function getDayId(date: Date): number {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return parseInt(`${year}${month}${day}`, 10);
}

/**
 * Parse day ID to date
 */
export function parseDayId(dayId: number): Date {
  const dayIdStr = String(dayId);
  const year = parseInt(dayIdStr.substring(0, 4), 10);
  const month = parseInt(dayIdStr.substring(4, 6), 10) - 1;
  const day = parseInt(dayIdStr.substring(6, 8), 10);
  
  return new Date(Date.UTC(year, month, day));
}

/**
 * Check if a day ID is valid
 */
export function isValidDayId(dayId: number): boolean {
  const dayIdStr = String(dayId);
  if (dayIdStr.length !== 8) return false;
  
  const date = parseDayId(dayId);
  return !isNaN(date.getTime());
}

