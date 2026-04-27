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
  ServicableItem,
  Create_ServiceableItem_WC_MLS_XAction,
  Create_ServicableItem_WC_MLS_XAction_Response,
  Update_ServicableItemStatus_WC_MLS_XAction,
  Update_ServicableItemStatus_WC_MLS_XAction_Response,
  Get_VillaFacilityItems_WC_MLS_XAction_Response,
  Get_VillaFacilities_WC_MLS_XAction_Response,
  Create_VillaFacilityItem_WC_MLS_XAction,
  Create_VillaFacilityItem_WC_MLS_XAction_Response,
  VillaNearbyService,
  Create_VillaNearbyService_WC_MLS_XAction,
  Create_VillaNearbyService_WC_MLS_XAction_Response,
  Get_VillaPropertyGalleries_WC_MLS_XAction_Response,
  Create_PropertyGallery_WC_MLS_XAction,
  Create_PropertyGallery_WC_MLS_XAction_Response,
  Upload_PropertyGallery_Images_Response,
  Update_PropertyGalleryOrders_WC_MLS_XAction,
  Update_PropertyGalleryOrders_WC_MLS_XAction_Response,
  VillaRatePlan,
  Create_VillaRatePlan_WC_MLS_XAction,
  Create_VillaRatePlan_WC_MLS_XAction_Response,
  Get_ParityRates_WC_MLS_XAction_Response,
  Create_ParityRate_WC_MLS_XAction,
  Create_ParityRate_WC_MLS_XAction_Response,
} from '@/types';
import { imageCacheService } from './image-cache';

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

  deleteBooking: async (id: string): Promise<void> => {
    await api.delete(`/villa-bookings/${id}`);
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

// Serviceable Items API
export const servicableItemsApi = {
  // Get serviceable items for a villa
  getServicableItems: async (villaid: string, page = 0, size = 10): Promise<Page<ServicableItem>> => {
    const response = await api.get<GenericApiResponse<Page<ServicableItem>>>('/servicable-items', {
      params: { villaid, page, size }
    });
    return response.data.object;
  },

  // Get serviceable items for current user's villa
  getCurrentVillaServicableItems: async (page = 0, size = 10): Promise<Page<ServicableItem>> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return servicableItemsApi.getServicableItems(villaAdminUser.villa.id, page, size);
  },

  // Create serviceable item
  createServicableItem: async (servicableItemData: Create_ServiceableItem_WC_MLS_XAction): Promise<Create_ServicableItem_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_ServicableItem_WC_MLS_XAction_Response>>('/servicable-items', servicableItemData);
    return response.data.object;
  },

  // Helper function to create serviceable item for current user's villa
  createCurrentVillaServicableItem: async (
    servicableItemData: Omit<Create_ServiceableItem_WC_MLS_XAction, 'villaid'>
  ): Promise<Create_ServicableItem_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return servicableItemsApi.createServicableItem({
      ...servicableItemData,
      villaid: villaAdminUser.villa.id,
    });
  },

  // Update serviceable item status
  updateServicableItemStatus: async (
    servicableItemId: string, 
    statusData: Update_ServicableItemStatus_WC_MLS_XAction
  ): Promise<Update_ServicableItemStatus_WC_MLS_XAction_Response> => {
    const response = await api.put<GenericApiResponse<Update_ServicableItemStatus_WC_MLS_XAction_Response>>(
      `/servicable-items/${servicableItemId}/status`, 
      statusData
    );
    return response.data.object;
  },

  // Delete serviceable item
  deleteServicableItem: async (servicableItemId: string): Promise<void> => {
    await api.delete(`/servicable-items/${servicableItemId}`);
  },
};

// Villa Facilities API
export const villaFacilitiesApi = {
  // Get villa facilities for a villa (current facilities)
  getVillaFacilityItems: async (villaid: string): Promise<Get_VillaFacilityItems_WC_MLS_XAction_Response> => {
    const response = await api.get<GenericApiResponse<Get_VillaFacilityItems_WC_MLS_XAction_Response>>(`/villas/${villaid}/villa-facilities`);
    return response.data.object;
  },

  // Get villa facilities for current user's villa
  getCurrentVillaFacilityItems: async (): Promise<Get_VillaFacilityItems_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaFacilitiesApi.getVillaFacilityItems(villaAdminUser.villa.id);
  },

  // Get all available villa facilities from pool
  getAvailableVillaFacilities: async (): Promise<Get_VillaFacilities_WC_MLS_XAction_Response> => {
    const response = await api.get<GenericApiResponse<Get_VillaFacilities_WC_MLS_XAction_Response>>('/villa-facilities');
    return response.data.object;
  },

  // Create villa facility item (add facility to villa)
  createVillaFacilityItem: async (
    villaid: string, 
    facilityData: Create_VillaFacilityItem_WC_MLS_XAction
  ): Promise<Create_VillaFacilityItem_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_VillaFacilityItem_WC_MLS_XAction_Response>>(
      `/villas/${villaid}/villa-facilities`, 
      facilityData
    );
    return response.data.object;
  },

  // Create villa facility item for current user's villa
  createCurrentVillaFacilityItem: async (
    facilityData: Create_VillaFacilityItem_WC_MLS_XAction
  ): Promise<Create_VillaFacilityItem_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaFacilitiesApi.createVillaFacilityItem(villaAdminUser.villa.id, facilityData);
  },
};

// Villa Nearby Services API
export const villaNearbyServicesApi = {
  // Get villa nearby services for a villa
  getVillaNearbyServices: async (villaid: string): Promise<VillaNearbyService[]> => {
    const response = await api.get<GenericApiResponse<VillaNearbyService[]>>('/villa-nearby-services', {
      params: { villaid }
    });
    return response.data.object;
  },

  // Get villa nearby services for current user's villa
  getCurrentVillaNearbyServices: async (): Promise<VillaNearbyService[]> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaNearbyServicesApi.getVillaNearbyServices(villaAdminUser.villa.id);
  },

  // Create villa nearby service
  createVillaNearbyService: async (
    serviceData: Create_VillaNearbyService_WC_MLS_XAction
  ): Promise<Create_VillaNearbyService_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_VillaNearbyService_WC_MLS_XAction_Response>>(
      '/villa-nearby-services', 
      serviceData
    );
    return response.data.object;
  },

  // Create villa nearby service for current user's villa
  createCurrentVillaNearbyService: async (
    serviceData: Omit<Create_VillaNearbyService_WC_MLS_XAction, 'villaid'>
  ): Promise<Create_VillaNearbyService_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaNearbyServicesApi.createVillaNearbyService({
      ...serviceData,
      villaid: villaAdminUser.villa.id,
    });
  },
};

// Property Galleries API
export const propertyGalleriesApi = {
  getPropertyGalleries: async (villaId: string): Promise<Get_VillaPropertyGalleries_WC_MLS_XAction_Response> => {
    const response = await api.get<GenericApiResponse<Get_VillaPropertyGalleries_WC_MLS_XAction_Response>>(
      `/villas/${villaId}/property-galleries`
    );
    return response.data.object;
  },

  getCurrentVillaPropertyGalleries: async (): Promise<Get_VillaPropertyGalleries_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    return propertyGalleriesApi.getPropertyGalleries(villaAdminUser.villa.id);
  },

  createPropertyGallery: async (
    villaId: string,
    galleryData: Create_PropertyGallery_WC_MLS_XAction
  ): Promise<Create_PropertyGallery_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_PropertyGallery_WC_MLS_XAction_Response>>(
      `/villas/${villaId}/property-galleries`,
      galleryData
    );
    return response.data.object;
  },

  createCurrentVillaPropertyGallery: async (
    galleryData: Create_PropertyGallery_WC_MLS_XAction
  ): Promise<Create_PropertyGallery_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    return propertyGalleriesApi.createPropertyGallery(villaAdminUser.villa.id, galleryData);
  },

  uploadGalleryImages: async (
    galleryId: string,
    file: File,
    description?: string,
    uploadId?: string
  ): Promise<Upload_PropertyGallery_Images_Response> => {
    console.log(`Starting upload to /property-galleries/${galleryId}/images`);
    console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    console.log(`Description: ${description || 'none'}, UploadId: ${uploadId || 'none'}`);
    
    const formData = new FormData();
    formData.append('file', file);
    if (description && description.trim() !== '') {
      formData.append('description', description.trim());
    }
    if (uploadId) {
      formData.append('uploadId', uploadId);
    }

    // Log the FormData contents
    console.log('FormData entries:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    const response = await api.post<Upload_PropertyGallery_Images_Response>(
      `/property-galleries/${galleryId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    console.log('Upload response:', response.data);
    return response.data;
  },

  deleteGalleryImage: async (galleryId: string, imageId: string): Promise<void> => {
    await api.delete(`/property-galleries/${galleryId}/images/${imageId}`);
  },

  deletePropertyGallery: async (galleryId: string): Promise<void> => {
    await api.delete(`/property-galleries/${galleryId}`);
  },

  reorderPropertyGalleries: async (
    body: Update_PropertyGalleryOrders_WC_MLS_XAction
  ): Promise<Update_PropertyGalleryOrders_WC_MLS_XAction_Response> => {
    const response = await api.patch<GenericApiResponse<Update_PropertyGalleryOrders_WC_MLS_XAction_Response>>(
      '/property-galleries/re-order',
      body
    );
    return response.data.object;
  },
};

// Image Cache API
export const imageCacheApi = {
  // Get cached image URL or fetch and cache if not available
  getCachedImageUrl: async (imageUrl: string): Promise<string | null> => {
    try {
      return await imageCacheService.getImage(imageUrl);
    } catch (error) {
      console.error('Failed to get cached image:', error);
      return null;
    }
  },

  // Preload multiple images for better performance
  preloadImages: async (imageUrls: string[]): Promise<void> => {
    try {
      await imageCacheService.preloadImages(imageUrls);
    } catch (error) {
      console.error('Failed to preload images:', error);
    }
  },

  // Clear all cached images
  clearImageCache: async (): Promise<void> => {
    try {
      await imageCacheService.clearCache();
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  },

  // Get cache statistics for debugging/monitoring
  getCacheStats: async () => {
    try {
      return await imageCacheService.getCacheStats();
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        memoryEntries: 0,
        memorySizeMB: 0,
        indexedDBEntries: 0,
        indexedDBSizeMB: 0,
      };
    }
  },

  // Helper method to get property gallery image URLs for preloading
  preloadPropertyGalleryImages: async (villaId?: string): Promise<void> => {
    try {
      const galleries = villaId 
        ? await propertyGalleriesApi.getPropertyGalleries(villaId)
        : await propertyGalleriesApi.getCurrentVillaPropertyGalleries();
      
      const imageUrls: string[] = [];
      galleries.galleries?.forEach(gallery => {
        gallery.images?.forEach(image => {
          if (image.resizedlargefile.url) {
            imageUrls.push(image.resizedlargefile.url);
          }
        });
      });

      if (imageUrls.length > 0) {
        await imageCacheApi.preloadImages(imageUrls);
      }
    } catch (error) {
      console.error('Failed to preload property gallery images:', error);
    }
  },
};

// Villa Rate Plans API
export const villaRatePlansApi = {
  // Get villa rate plans for a villa
  getVillaRatePlans: async (villaId: string): Promise<VillaRatePlan[]> => {
    const response = await api.get<GenericApiResponse<VillaRatePlan[]>>(`/villas/${villaId}/villa-rate-plans`);
    return response.data.object;
  },

  // Helper function to get villa rate plans for current user's villa
  getCurrentVillaRatePlans: async (): Promise<VillaRatePlan[]> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaRatePlansApi.getVillaRatePlans(villaAdminUser.villa.id);
  },

  // Create a new villa rate plan
  createVillaRatePlan: async (villaId: string, ratePlanData: Create_VillaRatePlan_WC_MLS_XAction): Promise<Create_VillaRatePlan_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_VillaRatePlan_WC_MLS_XAction_Response>>(`/villas/${villaId}/villa-rate-plans`, ratePlanData);
    return response.data.object;
  },

  // Helper function to create villa rate plan for current user's villa
  createCurrentVillaRatePlan: async (
    ratePlanData: Create_VillaRatePlan_WC_MLS_XAction
  ): Promise<Create_VillaRatePlan_WC_MLS_XAction_Response> => {
    const villaAdminUser = authApi.getCurrentVillaAdminUser();
    if (!villaAdminUser || !villaAdminUser.villa.id) {
      throw new Error('No villa found for current user');
    }
    
    return villaRatePlansApi.createVillaRatePlan(villaAdminUser.villa.id, ratePlanData);
  },

  // Delete a villa rate plan
  deleteVillaRatePlan: async (ratePlanId: string): Promise<void> => {
    await api.delete(`/villa-rate-plans/${ratePlanId}`);
  },
};

// Parity Rates API
export const parityRatesApi = {
  // Get all parity rates
  getParityRates: async (): Promise<Get_ParityRates_WC_MLS_XAction_Response> => {
    const response = await api.get<GenericApiResponse<Get_ParityRates_WC_MLS_XAction_Response>>('/parities');
    return response.data.object;
  },

  // Create a new parity rate
  createParityRate: async (parityRateData: Create_ParityRate_WC_MLS_XAction): Promise<Create_ParityRate_WC_MLS_XAction_Response> => {
    const response = await api.post<GenericApiResponse<Create_ParityRate_WC_MLS_XAction_Response>>('/parities', parityRateData);
    return response.data.object;
  },
};