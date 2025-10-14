import { VillaStatConstants, type VillaStat } from '@/types';

/**
 * Utility functions for handling villa statistics
 */

/**
 * Get a user-friendly title for a given stat code
 */
export const getStatTitle = (statcode: string): string => {
  switch (statcode) {
    case VillaStatConstants.BOOKINGS_TOTAL_STATCODE:
      return 'Total Bookings';
    case VillaStatConstants.BOOKING_NIGHTS_TOTAL_STATCODE:
      return 'Total Nights';
    case VillaStatConstants.REVENUE_TOTAL_STATCODE:
      return 'Total Revenue';
    case VillaStatConstants.VILLA_OCCUPANCY_RATE_STATCODE:
      return 'Occupancy Rate';
    default:
      // Convert from snake_case or dot.case to Title Case
      return statcode
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
  }
};

/**
 * Format a stat value with its prefix and suffix
 */
export const formatStatValue = (stat: VillaStat): string => {
  const { value, prefix = '', suffix = '' } = stat;
  return `${prefix}${value}${suffix}`;
};

/**
 * Get a human-readable "time ago" string from a timestamp
 */
export const getLastUpdateText = (timestamp: number): string => {
  const now = new Date();
  const updateTime = new Date(timestamp * 1000); // Convert to milliseconds
  const diffMs = now.getTime() - updateTime.getTime();
  
  // Handle future timestamps (server time ahead)
  if (diffMs < 0) {
    return 'Just now';
  }
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  }
};

/**
 * Get a fallback color if the stat doesn't have a valid color
 */
export const getStatColor = (color: string): string => {
  // Check if color is a valid CSS color (hex, rgb, hsl, or named color)
  if (!color || color.trim() === '') {
    return '#6B7280'; // Default gray color
  }
  
  // Basic validation for hex colors
  if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
    return color;
  }
  
  // Allow common CSS color names and rgb/hsl functions
  if (color.match(/^(rgb|hsl|rgba|hsla)\(/) || 
      color.match(/^(red|blue|green|yellow|purple|orange|pink|indigo|gray|black|white)$/i)) {
    return color;
  }
  
  return '#6B7280'; // Default gray color for invalid colors
};

/**
 * Sort villa stats by a predefined order for consistent display
 */
export const sortVillaStats = (stats: VillaStat[]): VillaStat[] => {
  const order = [
    VillaStatConstants.BOOKINGS_TOTAL_STATCODE,
    VillaStatConstants.BOOKING_NIGHTS_TOTAL_STATCODE,
    VillaStatConstants.REVENUE_TOTAL_STATCODE,
    VillaStatConstants.VILLA_OCCUPANCY_RATE_STATCODE,
  ];
  
  return stats.sort((a, b) => {
    const aIndex = order.indexOf(a.statcode as any);
    const bIndex = order.indexOf(b.statcode as any);
    
    // If both are in the order array, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order array, sort alphabetically
    return a.statcode.localeCompare(b.statcode);
  });
};