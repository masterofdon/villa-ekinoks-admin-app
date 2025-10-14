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
  address: Address;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type Price = {
  amount: string;
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

export type Page<T> = {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  sort: Sort;
  first: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  empty: boolean;
  pageable: Pageable;
}

export type Pageable = {
  sort: Sort;
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export type Sort = {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

// Calendar Management Types
export type SimpleVillaBooking = {
  id: string;
  startdate: string;
  enddate: string;
  inquiror: AppUser;
};

export type VillaPricingWithVillaBooking = {
  pricing: VillaPricingSchema;
  bookings: SimpleVillaBooking[];
};

// Villa Stats Types
export type VillaStat = {
  id: string;
  lastupdate: number; // timestamp
  statcode: string;
  value: string;
  prefix: string;
  suffix: string;
  color: string;
};

export type Get_VillaStats_WC_MLS_XAction_Response = {
  stats: VillaStat[];
};

// Villa Stat Constants (matching Java backend)
export const VillaStatConstants = {
  BOOKINGS_TOTAL_STATCODE: 'bookings.total',
  BOOKING_NIGHTS_TOTAL_STATCODE: 'bookings.nights.total',
  REVENUE_TOTAL_STATCODE: 'bookings.revenue.total',
  VILLA_OCCUPANCY_RATE_STATCODE: 'villa.occupancy.rate',
} as const;

// Villa Booking Types
export type VillaBookingTimestamps = {
  creationdate: number;
  lastupdate: number;
};

export type VillaBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type Payment = {
  id: string;
  status: PaymentStatus;
  externalid: string;
  amount: string;
  currency: string;
  creationdate: string;
};

export type VillaGuestUser = AppUser & {
  identitynumber: string;
};

export type ServicableItem = {
  id: string;
  name: string;
  description: string;
  price: Price;
};

export type VillaBookingAdditionalService = {
  item: ServicableItem;
  payment?: Payment;
  quantity: number;
};

export type VillaBookingSummaryView = {
  id: string;
  timestamps: VillaBookingTimestamps;
  startdate: string; // YYYYMMDD format
  enddate: string; // YYYYMMDD format
  status: VillaBookingStatus;
  inquiror: VillaGuestUser;
  services?: VillaBookingAdditionalService[];
  bookingpayment?: Payment;
  numberofguests: number;
  guests?: VillaBookingGuest[]
};

// Villa Bookings Filter Types
export type VillaBookingsFilter = {
  villaid: string; // required
  startdate?: string; // optional YYYYMMDD format
  enddate?: string; // optional YYYYMMDD format
  query?: string; // optional free text search
  page: number;
  size: number;
};

export type VillaBookingGuest = {
  id: string;
  personalinfo: VillaBookingGuestPersonalInfo;
}

export type VillaBookingGuestPersonalInfo = {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  phonenumber: string;
  passportno: string;
  passportcountry: string;
  age: number;
  passportfront: AppFile;
  passportback: AppFile;
};

export type AppFile = {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number; // in bytes
}

// Booking Details Types
export type BookingInquirorDetails = {
  personalInfo: VillaBookingGuestPersonalInfo;
  contactDetails: {
    email: string;
    phone: string;
    alternatePhone?: string;
  };
  identityVerification: {
    identityNumber: string;
    passportDetails: {
      passportNumber: string;
      country: string;
      frontImage: AppFile;
      backImage: AppFile;
    };
  };
};

export type BookingPaymentDetails = {
  bookingPayment: Payment;
  additionalServices: VillaBookingAdditionalService[];
  totalAmount: number;
  currency: string;
  paymentBreakdown: {
    accommodationTotal: number;
    servicesTotal: number;
    taxesAndFees: number;
    discounts: number;
  };
};

export type BookingFullDetails = VillaBookingSummaryView & {
  inquirorDetails: BookingInquirorDetails;
  paymentDetails: BookingPaymentDetails;
  villa: Villa;
  specialRequests?: string;
  internalNotes?: string;
};