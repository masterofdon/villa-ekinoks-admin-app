'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useVillaStats } from '@/hooks/api';
import { VillaStatConstants, type VillaStat } from '@/types';
import { 
  getStatTitle, 
  formatStatValue, 
  getLastUpdateText, 
  getStatColor,
  sortVillaStats 
} from '@/lib/villa-stats-utils';
import { 
  Calendar, 
  Moon, 
  DollarSign, 
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

// Icon mapping for different stat codes
const getStatIcon = (statcode: string) => {
  switch (statcode) {
    case VillaStatConstants.BOOKINGS_TOTAL_STATCODE:
      return Calendar;
    case VillaStatConstants.BOOKING_NIGHTS_TOTAL_STATCODE:
      return Moon;
    case VillaStatConstants.REVENUE_TOTAL_STATCODE:
      return DollarSign;
    case VillaStatConstants.VILLA_OCCUPANCY_RATE_STATCODE:
      return TrendingUp;
    default:
      return BarChart3;
  }
};

export default function VillaStatsCards() {
  const { data: villaStatsResponse, isLoading, error } = useVillaStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Activity className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load villa statistics</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = villaStatsResponse?.stats || [];

  if (stats.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No statistics available</p>
            <p className="text-sm text-gray-500">Stats will appear once data is available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort stats for consistent display order
  const sortedStats = sortVillaStats(stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedStats.map((stat) => {
        const StatIcon = getStatIcon(stat.statcode);
        const title = getStatTitle(stat.statcode);
        const formattedValue = formatStatValue(stat);
        const lastUpdateText = getLastUpdateText(stat.lastupdate);
        const statColor = getStatColor(stat.color);
        
        return (
          <Card key={stat.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {title}
              </CardTitle>
              <StatIcon 
                className="h-4 w-4" 
                style={{ color: statColor }}
              />
            </CardHeader>
            <CardContent>
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: statColor }}
              >
                {formattedValue}
              </div>
              <p className="text-xs text-gray-500">
                Updated {lastUpdateText}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}