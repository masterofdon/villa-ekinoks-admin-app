import { LayoutDashboard, Settings, Calendar, BookOpen, Percent, Package, Sparkles, Images, Calculator, ArrowLeftRight, Building2 } from 'lucide-react';

export const NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: BookOpen },
  { name: 'Villa Facilities', href: '/villa-facilities', icon: Sparkles },
  { name: 'Serviceable Items', href: '/servicable-items', icon: Package },
  { name: 'Villa Rate Plans', href: '/villa-rate-plans', icon: Calculator },
  { name: 'Parity Rates', href: '/parity-rates', icon: ArrowLeftRight },
  { name: 'Discount Codes', href: '/discount-codes', icon: Percent },
  { name: 'Property Galleries', href: '/property-galleries', icon: Images },
  { name: 'Property Rentables', href: '/property-rentables', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];
