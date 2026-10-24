'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tooltip } from 'antd';
import { LayoutDashboard, Settings, Calendar, BookOpen, Percent, Package, Sparkles, Images, Calculator, ArrowLeftRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ekinoksLogo from '../../../assets/logo/logo-symbol-color.svg';

const navigation = [
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

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 px-2 border-b border-gray-200">
        <Image src={ekinoksLogo} alt="Villa Ekinoks" priority className="h-auto w-8" />
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Tooltip key={item.name} title={item.name} placement="right">
              <Link
                href={item.href}
                aria-label={item.name}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-center h-10 text-brand-olive rounded-lg hover:bg-brand-olive/10 hover:text-brand-olive transition-colors',
                  isActive && 'bg-brand-olive/10'
                )}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
