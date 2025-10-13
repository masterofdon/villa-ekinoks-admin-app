// Generic API Response structure
export type GenericApiResponse<T> = {
  code: number;
  message: string;
  responsecode: string;
  object: T;
  resulthashcode?: string;
};

// User types
export type AppUserPersonalInfo = {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phonenumber: string;
  identitynumber: string;
};

export type AppUser = {
  id: string;
  personalinfo: AppUserPersonalInfo;
};

export type VillaAdminUser = AppUser & {
  villa: Villa;
};

export type TokenizedUser = {
  accesstoken: string;
  refreshtoken: string;
  user: AppUser;
};

// Login flow types
export type AppUserLogin_WC_MLS_XAction = {
  login: string;
  password: string;
};

export type AppUserLogin_WC_MLS_XAction_Response = {
  ackid: string;
  requestid: string;
};

export type Verify_LoginVerification_XAction = {
  requestid: string;
  code: string;
};

export type VillaPublicInfo = {
  name: string;
  description: string;
  location: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
};

export type VillaPrivateInfo = {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Price = {
  amount: number;
  currency: string;
};

export type PricingRange = {
  id: string;
  startperiod: string;
  endperiod: string;
  pricepernight: Price;
};

export type VillaPricingSchema = {
  id: string;
  pricingranges: PricingRange[];
};

export type Villa = {
  id: string;
  publicinfo: VillaPublicInfo;
  privateinfo: VillaPrivateInfo;
  pricing: VillaPricingSchema;
};

export interface CreateVillaRequest {
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

export interface UpdateVillaRequest extends Partial<CreateVillaRequest> {
  isActive?: boolean;
}

export interface DashboardStats {
  totalVillas: number;
  activeVillas: number;
  totalBookings: number;
  revenue: number;
  recentBookings: Booking[];
}

export interface Booking {
  id: string;
  villaId: string;
  villaName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}