'use client';

import React from 'react';
import { VillaStatsCards } from '@/components/dashboard';
import { useDashboardStats, useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Building2, Calendar, DollarSign, Users, User, MapPin, Bed, Bath, Home } from 'lucide-react';
import type { VillaAdminUser } from '@/types';
import styles from './page.module.css';

export default function DashboardPage() {

  const { data: user } = useCurrentUser();

  // Type assertion to VillaAdminUser since logged in user should have villa field
  const villaAdminUser = user as VillaAdminUser;



  const additionalStatCards = [
    {
      title: 'Villa Status',
      value: 'Active',
      icon: Building2,
      color: styles.color,
    },
    {
      title: 'Max Guests',
      value: villaAdminUser?.villa?.publicinfo?.maxGuests || 0,
      icon: Users,
      color: styles.color2,
    },
  ];

  return (
    <div className={styles.div}>
      <div>
        <h1 className={styles.h1}>Dashboard</h1>
        <p className={styles.p}>
          Welcome back{user ? `, ${user.personalinfo.firstname} ${user.personalinfo.lastname}` : ''}!
          Here&apos;s an overview of your villa management system.
        </p>
      </div>
      <div>
        <h2 className={styles.h2}>Villa Statistics</h2>
        <VillaStatsCards />
      </div>
      <div>
        <h2 className={styles.h2}>Villa Information</h2>
        <div className={styles.div2}>
          {additionalStatCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className={styles.cardHeader}>
                <CardTitle className={styles.cardTitle}>
                  {stat.title}
                </CardTitle>
                <stat.icon className={`${styles.icon} ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={styles.div3}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Villa Details Card */}
      {villaAdminUser?.villa && (
        <Card>
          <CardHeader className={styles.cardHeader2}>
            <CardTitle className={styles.cardTitle2}>
              <Home className={styles.home} />
              Villa Details
            </CardTitle>
            <div className={styles.div4}>
            </div>
          </CardHeader>
          <CardContent className={styles.div}>
            {/* Villa Basic Info */}
            <div className={styles.div5}>
              <div className={styles.div6}>
                <div>
                  <h3 className={styles.h3}>
                    {villaAdminUser.villa.publicinfo.name}
                  </h3>
                  <p className={styles.p2}>
                    <MapPin className={styles.mapPin} />
                    {villaAdminUser.villa.publicinfo.location}
                  </p>
                </div>

                <div className={styles.div7}>
                  <div className={styles.div8}>
                    <div className={styles.div9}>
                      <Users className={styles.users} />
                    </div>
                    <p className={styles.p3}>Max Guests</p>
                    <p className={styles.p4}>{villaAdminUser.villa.publicinfo.maxGuests}</p>
                  </div>
                  <div className={styles.div8}>
                    <div className={styles.div10}>
                      <Bed className={styles.bed} />
                    </div>
                    <p className={styles.p3}>Bedrooms</p>
                    <p className={styles.p4}>{villaAdminUser.villa.publicinfo.bedrooms}</p>
                  </div>
                  <div className={styles.div8}>
                    <div className={styles.div11}>
                      <Bath className={styles.bath} />
                    </div>
                    <p className={styles.p3}>Bathrooms</p>
                    <p className={styles.p4}>{villaAdminUser.villa.publicinfo.bathrooms}</p>
                  </div>
                </div>
              </div>

              <div className={styles.div6}>
                <div>
                  <h4 className={styles.h4}>Description</h4>
                  <p className={styles.p5}>
                    {villaAdminUser.villa.publicinfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {villaAdminUser.villa.publicinfo.amenities && villaAdminUser.villa.publicinfo.amenities.length > 0 && (
              <div>
                <h4 className={styles.h42}>Amenities</h4>
                <div className={styles.div12}>
                  {villaAdminUser.villa.publicinfo.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className={styles.span}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Info */}
            {villaAdminUser.villa.pricing && villaAdminUser.villa.pricing.pricingranges && villaAdminUser.villa.pricing.pricingranges.length > 0 && (
              <div>
                <h4 className={styles.h42}>Pricing Ranges</h4>
                <div className={styles.div13}>
                  {villaAdminUser.villa.pricing.pricingranges.map((range, index) => (
                    <div key={range.id || index} className={styles.div14}>
                      <p className={styles.p3}>
                        {new Date(range.startperiod).toLocaleDateString()} - {new Date(range.endperiod).toLocaleDateString()}
                      </p>
                      <p className={styles.p6}>
                        {formatCurrency(parseFloat(range.pricepernight.amount))} <span className={styles.span2}>/ night</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Villa Management Info */}
            <div className={styles.div15}>
              <h4 className={styles.h4}>Management Information</h4>
              <div className={styles.div16}>
                <div>
                  <p className={styles.p}>Villa ID</p>
                  <p className={styles.p7}>{villaAdminUser.villa.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}