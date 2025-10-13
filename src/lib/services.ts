import api from '@/lib/api';
import type {
  AppUserLogin_WC_MLS_XAction,
  AppUserLogin_WC_MLS_XAction_Response,
  Verify_LoginVerification_XAction,
  TokenizedUser,
  AppUser,
  GenericApiResponse,
  Villa,
  CreateVillaRequest,
  UpdateVillaRequest,
  DashboardStats,
  PaginatedResponse,
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
    
    // Store tokens and user data in localStorage
    const tokenizedUser = response.data.object;
    localStorage.setItem('accesstoken', tokenizedUser.accesstoken);
    localStorage.setItem('refreshtoken', tokenizedUser.refreshtoken);
    localStorage.setItem('user', JSON.stringify(tokenizedUser.user));
    
    return tokenizedUser;
  },

  logout: async (): Promise<void> => {
    // Clear tokens and user data from localStorage
    localStorage.removeItem('accesstoken');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('user');
    // You can add a logout API call here if needed
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accesstoken');
  },

  // Get current access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('accesstoken');
  },

  // Get current refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshtoken');
  },

  // Get current user data
  getCurrentUser: (): AppUser | null => {
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
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<GenericApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.object;
  },
};

export const villasApi = {
  getVillas: async (page = 1, limit = 10): Promise<PaginatedResponse<Villa>> => {
    const response = await api.get<GenericApiResponse<PaginatedResponse<Villa>>>('/villas', {
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