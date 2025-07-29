/**
 * Cost calculation utilities
 * Rate: $0.15 per minute
 */

export const COST_PER_MINUTE = 0.15;

/**
 * Calculate cost based on duration in seconds
 * @param durationSeconds Duration in seconds
 * @returns Cost in USD
 */
export const calculateCostFromSeconds = (durationSeconds: number): number => {
  const durationMinutes = durationSeconds / 60;
  return Math.round(durationMinutes * COST_PER_MINUTE * 100) / 100; // Round to 2 decimals
};

/**
 * Calculate cost based on duration in minutes
 * @param durationMinutes Duration in minutes
 * @returns Cost in USD
 */
export const calculateCostFromMinutes = (durationMinutes: number): number => {
  return Math.round(durationMinutes * COST_PER_MINUTE * 100) / 100; // Round to 2 decimals
};

/**
 * Convert balance to minutes
 * @param balanceUsd Balance in USD
 * @returns Available minutes
 */
export const convertBalanceToMinutes = (balanceUsd: number): number => {
  return Math.floor(balanceUsd / COST_PER_MINUTE);
};

/**
 * Format duration from seconds to MM:SS format
 * @param durationSeconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (durationSeconds: number): string => {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format duration from seconds to human readable format
 * @param durationSeconds Duration in seconds
 * @returns Human readable duration string
 */
export const formatDurationHuman = (durationSeconds: number): string => {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  if (seconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${seconds}s`;
};