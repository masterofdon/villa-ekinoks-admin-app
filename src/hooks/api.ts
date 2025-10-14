import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, dashboardApi, villasApi, villaPricingApi, villaStatsApi, villaBookingsApi } from '@/lib/services';
import type { 
  AppUserLogin_WC_MLS_XAction, 
  Verify_LoginVerification_XAction,
  CreateVillaRequest, 
  UpdateVillaRequest,
  VillaBookingsFilter
} from '@/types';

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useVerifyLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.verifyLogin,
    onSuccess: (data) => {
      // Tokens and user data are already stored in localStorage by authApi.verifyLogin
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Auth state hooks
export const useAuthState = () => {
  return {
    isAuthenticated: authApi.isAuthenticated(),
    accessToken: authApi.getAccessToken(),
    refreshToken: authApi.getRefreshToken(),
    user: authApi.getCurrentUser(),
  };
};

// Get current user hook with reactive updates
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      const user = authApi.getCurrentUser();
      if (!user) {
        throw new Error('No user found');
      }
      return user;
    },
    enabled: authApi.isAuthenticated(),
    staleTime: Infinity, // User data doesn't change often
    retry: false,
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Villa hooks
export const useVillas = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['villas', page, limit],
    queryFn: () => villasApi.getVillas(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useVilla = (id: string) => {
  return useQuery({
    queryKey: ['villa', id],
    queryFn: () => villasApi.getVilla(id),
    enabled: !!id,
  });
};

export const useCreateVilla = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: villasApi.createVilla,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useUpdateVilla = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVillaRequest }) =>
      villasApi.updateVilla(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['villa', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useDeleteVilla = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: villasApi.deleteVilla,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

export const useToggleVillaStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: villasApi.toggleVillaStatus,
    onSuccess: (_, villaId) => {
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['villa', villaId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// Villa Pricing hooks
export const useVillaPricing = (villaId: string) => {
  return useQuery({
    queryKey: ['villa-pricing', villaId],
    queryFn: () => villaPricingApi.getDetailedPricing(villaId),
    enabled: !!villaId,
  });
};

export const useCurrentVillaPricing = () => {
  return useQuery({
    queryKey: ['current-villa-pricing'],
    queryFn: villaPricingApi.getCurrentVillaPricing,
    retry: false, // Don't retry if user doesn't have villa data
  });
};

// Villa Stats hooks
export const useVillaStats = () => {
  return useQuery({
    queryKey: ['villa-stats'],
    queryFn: villaStatsApi.getVillaStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    enabled: (() => {
      // Only enable if user is authenticated and has villa data
      if (!authApi.isAuthenticated()) return false;
      const villaAdminUser = authApi.getCurrentVillaAdminUser();
      return !!(villaAdminUser && villaAdminUser.villa && villaAdminUser.villa.id);
    })(),
    retry: false, // Don't retry if user doesn't have villa data
  });
};

// Villa Bookings hooks
export const useVillaBookings = (filter: Omit<VillaBookingsFilter, 'villaid'>) => {
  return useQuery({
    queryKey: ['villa-bookings', filter],
    queryFn: () => villaBookingsApi.getCurrentVillaBookings(filter),
    enabled: (() => {
      // Only enable if user is authenticated and has villa data
      if (!authApi.isAuthenticated()) return false;
      const villaAdminUser = authApi.getCurrentVillaAdminUser();
      return !!(villaAdminUser && villaAdminUser.villa && villaAdminUser.villa.id);
    })(),
    retry: false, // Don't retry if user doesn't have villa data
    staleTime: 1 * 60 * 1000, // 1 minute stale time
  });
};