import { authApi } from '@/lib/services';

/**
 * Utility functions for villa operations
 */
export const villaUtils = {
  /**
   * Get the current user's villa ID from localStorage
   * @returns string | null - Villa ID if found, null otherwise
   */
  getCurrentVillaId: (): string | null => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    return villaAdminUser?.villa?.id || null;
  },

  /**
   * Check if current user has a villa
   * @returns boolean - True if user has villa data
   */
  hasVillaAccess: (): boolean => {
    return !!villaUtils.getCurrentVillaId();
  },

  /**
   * Get villa name for current user
   * @returns string | null - Villa name if found
   */
  getCurrentVillaName: (): string | null => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    return villaAdminUser?.villa?.publicinfo?.name || null;
  },
};