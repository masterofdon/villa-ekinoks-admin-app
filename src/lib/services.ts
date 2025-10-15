import api from '@/lib/api';
import type {
  AppUserLogin_WC_MLS_XAction,
  AppUserLogin_WC_MLS_XAction_Response,
  Verify_LoginVerification_XAction,
  TokenizedUser,
  AppUser,
  VillaAdminUser,
  GenericApiResponse,
  Villa,
  CreateVillaRequest,
  UpdateVillaRequest,
  DashboardStats,
  Page,
  VillaPricingWithVillaBooking,
  Get_VillaStats_WC_MLS_XAction_Response,
  VillaBookingSummaryView,
  VillaBookingsFilter,
  Get_DiscountCode_WC_MLS_XAction_Response,
  Create_DiscountCode_WC_MLS_XAction,
  Create_DiscountCode_WC_MLS_XAction_Response,
  Update_DiscountCodeStatus_WC_MLS_XAction,
  Update_DiscountCodeStatus_WC_MLS_XAction_Response,
} from '@/types';

export const authApi = {
  // Step 1: Initial login request
  login: async (credentials: AppUserLogin_WC_MLS_XAction): Promise<AppUserLogin_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<AppUserLogin_WC_MLS_XAction_Response>>('/oauth/login', credentials);
    return response.data.object;
  },

  // Step 2: Verify login with code
  verifyLogin: async (verification: Verify_LoginVerification_XAction): Promise<TokenizedUser> => {
    const response = await api.post<GenericApiResponse<TokenizedUser>>('/verification-pair-controller/login-verifications', verification);
    
    // Store tokens and user data in localStorage (only on client side)
    const tokenizedUser = response.data.object;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accesstoken', tokenizedUser.accesstoken);
      localStorage.setItem('refreshtoken', tokenizedUser.refreshtoken);
      localStorage.setItem('user', JSON.stringify(tokenizedUser.user));
    }
    
    return tokenizedUser;
  },

  logout: async (): Promise<void> => {
    // Clear tokens and user data from localStorage (only on client side)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accesstoken');
      localStorage.removeItem('refreshtoken');
      localStorage.removeItem('user');
    }
    // You can add a logout API call here if needed
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      // Server-side rendering, assume not authenticated
      return false;
    }
    return !!localStorage.getItem('accesstoken');
  },

  // Get current access token
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accesstoken');
  },

  // Get current refresh token
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshtoken');
  },

  // Get current user data
  getCurrentUser: (): AppUser | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as AppUser;
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('user'); // Remove corrupted data
      return null;
    }
  },

  // Get current villa admin user (includes villa data)
  getCurrentVillaAdminUser: (): VillaAdminUser | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr) as VillaAdminUser;
      // Check if user has villa data
      if (!user.villa || !user.villa.id) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Failed to parse villa admin user data from localStorage:', error);
      localStorage.removeItem('user'); // Remove corrupted data
      return null;
    }
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<GenericApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.object;
  },
};

export const villasApi = {
  getVillas: async (page = 1, limit = 10): Promise<Page<Villa>> => {
    const response = await api.get<GenericApiResponse<Page<Villa>>>('/villas', {
      params: { page, limit },
    });
    return response.data.object;
  },

  getVilla: async (id: string): Promise<Villa> => {
    const response = await api.get<GenericApiResponse<Villa>>(`/villas/${id}`);
    return response.data.object;
  },

  createVilla: async (villa: CreateVillaRequest): Promise<Villa> => {
    const response = await api.post<GenericApiResponse<Villa>>('/villas', villa);
    return response.data.object;
  },

  updateVilla: async (id: string, villa: UpdateVillaRequest): Promise<Villa> => {
    const response = await api.put<GenericApiResponse<Villa>>(`/villas/${id}`, villa);
    return response.data.object;
  },

  deleteVilla: async (id: string): Promise<void> => {
    await api.delete(`/villas/${id}`);
  },

  toggleVillaStatus: async (id: string): Promise<Villa> => {
    const response = await api.patch<GenericApiResponse<Villa>>(`/villas/${id}/toggle-status`);
    return response.data.object;
  },
};

export const villaPricingApi = {
  getDetailedPricing: async (villaId: string): Promise<VillaPricingWithVillaBooking> => {
    const response = await api.get<GenericApiResponse<VillaPricingWithVillaBooking>>(`/villa-pricing/detailed`, {
      params: { villaid: villaId },
    });
    return response.data.object;
  },

  // Helper function to get pricing for current user's villa
  getCurrentVillaPricing: async (): Promise<VillaPricingWithVillaBooking> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    return villaPricingApi.getDetailedPricing(villaAdminUser.villa.id);
  },
};

export const villaStatsApi = {
  getVillaStats: async (): Promise<Get_VillaStats_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    const response = await api.get<GenericApiResponse<Get_VillaStats_WC_MLS_XAction_Response>>('/villa-stats', {
      params: { villaid: villaAdminUser.villa.id },
    });
    return response.data.object;
  },
};

export const villaBookingsApi = {
  getVillaBookings: async (filter: VillaBookingsFilter): Promise<Page<VillaBookingSummaryView>> => {
    const params: Record<string, string | number> = {
      villaid: filter.villaid,
      page: filter.page,
      size: filter.size,
    };

    if (filter.startdate) {
      params.startdate = filter.startdate;
    }
    if (filter.enddate) {
      params.enddate = filter.enddate;
    }
    if (filter.query) {
      params.query = filter.query;
    }

    const response = await api.get<GenericApiResponse<Page<VillaBookingSummaryView>>>('/villa-bookings', {
      params,
    });
    return response.data.object;
  },

  // Helper function to get bookings for current user's villa
  getCurrentVillaBookings: async (filter: Omit<VillaBookingsFilter, 'villaid'>): Promise<Page<VillaBookingSummaryView>> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaBookingsApi.getVillaBookings({
      ...filter,
      villaid: villaAdminUser.villa.id,
    });
  },
};

export const discountCodesApi = {
  // Get discount codes for a villa
  getDiscountCodes: async (villaid: string): Promise<Get_DiscountCode_WC_MLS_XAction_Response> => {
    const response = await api.get<GenericApiResponse<Get_DiscountCode_WC_MLS_XAction_Response>>('/discount-codes', {
      params: { villaid },
    });
    return response.data.object;
  },

  // Helper function to get discount codes for current user's villa
  getCurrentVillaDiscountCodes: async (): Promise<Get_DiscountCode_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return discountCodesApi.getDiscountCodes(villaAdminUser.villa.id);
  },

  // Create a new discount code
  createDiscountCode: async (discountCodeData: Create_DiscountCode_WC_MLS_XAction): Promise<Create_DiscountCode_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_DiscountCode_WC_MLS_XAction_Response>>('/discount-codes', discountCodeData);
    return response.data.object;
  },

  // Helper function to create discount code for current user's villa
  createCurrentVillaDiscountCode: async (
    discountCodeData: Omit<Create_DiscountCode_WC_MLS_XAction, 'villaid'>
  ): Promise<Create_DiscountCode_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return discountCodesApi.createDiscountCode({
      ...discountCodeData,
      villaid: villaAdminUser.villa.id,
    });
  },

  // Update discount code status
  updateDiscountCodeStatus: async (
    discountCodeId: string, 
    statusData: Update_DiscountCodeStatus_WC_MLS_XAction
  ): Promise<Update_DiscountCodeStatus_WC_MLS_XAction_Response> => {
    const response = await api.put<GenericApiResponse<Update_DiscountCodeStatus_WC_MLS_XAction_Response>>(
      `/discount-codes/${discountCodeId}/status`, 
      statusData
    );
    return response.data.object;
  },
};