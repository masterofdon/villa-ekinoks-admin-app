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
import styles from './VillaStatsCards.module.css';

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
      <div className={styles.div}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.div2}></div>
              <div className={styles.div3}></div>
            </CardHeader>
            <CardContent>
              <div className={styles.div4}></div>
              <div className={styles.div5}></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={styles.card2}>
        <CardContent className={styles.cardContent}>
          <div className={styles.div6}>
            <Activity className={styles.activity} />
            <p className={styles.p}>Failed to load villa statistics</p>
            <p className={styles.p2}>Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = villaStatsResponse?.stats || [];

  if (stats.length === 0) {
    return (
      <Card className={styles.card2}>
        <CardContent className={styles.cardContent}>
          <div className={styles.div6}>
            <BarChart3 className={styles.barChart3} />
            <p className={styles.p3}>No statistics available</p>
            <p className={styles.p2}>Stats will appear once data is available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort stats for consistent display order
  const sortedStats = sortVillaStats(stats);

  return (
    <div className={styles.div}>
      {sortedStats.map((stat) => {
        const StatIcon = getStatIcon(stat.statcode);
        const title = getStatTitle(stat.statcode);
        const formattedValue = formatStatValue(stat);
        const lastUpdateText = getLastUpdateText(stat.lastupdate);
        const statColor = getStatColor(stat.color);
        
        return (
          <Card key={stat.id} className={styles.card3}>
            <CardHeader className={styles.cardHeader}>
              <CardTitle className={styles.cardTitle}>
                {title}
              </CardTitle>
              <StatIcon 
                className={styles.statIcon} 
                style={{ color: statColor }}
              />
            </CardHeader>
            <CardContent>
              <div 
                className={styles.div7}
                style={{ color: statColor }}
              >
                {formattedValue}
              </div>
              <p className={styles.p4}>
                Updated {lastUpdateText}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}