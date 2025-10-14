'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useDashboardStats, useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Building2, Calendar, DollarSign, Users, User, MapPin, Bed, Bath, Home } from 'lucide-react';
import type { VillaAdminUser } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: user } = useCurrentUser();

  // Type assertion to VillaAdminUser since logged in user should have villa field
  const villaAdminUser = user as VillaAdminUser;

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-600">Failed to load dashboard data</div>
        </div>
      </Sidebar>
    );
  }

  const statCards = [
    {
      title: 'Villa Status',
      value: 'Active',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Max Guests',
      value: villaAdminUser?.villa?.publicinfo?.maxGuests || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats?.revenue || 0),
      icon: DollarSign,
      color: 'text-yellow-600',
    },
  ];

  return (
    <AuthGuard>
      <Sidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back{user ? `, ${user.personalinfo.firstname} ${user.personalinfo.lastname}` : ''}!
              Here&apos;s an overview of your villa management system.
            </p>
          </div>

          {/* User Info Card */}
          {user && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">
                      {[user.personalinfo.firstname, user.personalinfo.middlename, user.personalinfo.lastname]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.personalinfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.personalinfo.phonenumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-medium text-xs">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Villa Details Card */}
          {villaAdminUser?.villa && (
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Villa Details
                </CardTitle>
                <div className="ml-auto">
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Villa Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {villaAdminUser.villa.publicinfo.name}
                      </h3>
                      <p className="text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {villaAdminUser.villa.publicinfo.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600">Max Guests</p>
                        <p className="font-semibold">{villaAdminUser.villa.publicinfo.maxGuests}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                          <Bed className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold">{villaAdminUser.villa.publicinfo.bedrooms}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                          <Bath className="h-6 w-6 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-semibold">{villaAdminUser.villa.publicinfo.bathrooms}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {villaAdminUser.villa.publicinfo.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {villaAdminUser.villa.publicinfo.amenities && villaAdminUser.villa.publicinfo.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {villaAdminUser.villa.publicinfo.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
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
                    <h4 className="font-medium text-gray-900 mb-3">Pricing Ranges</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {villaAdminUser.villa.pricing.pricingranges.map((range, index) => (
                        <div key={range.id || index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {new Date(range.startperiod).toLocaleDateString()} - {new Date(range.endperiod).toLocaleDateString()}
                          </p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(parseFloat(range.pricepernight.amount))} <span className="text-sm font-normal text-gray-600">/ night</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Villa Management Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Management Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Villa ID</p>
                      <p className="font-mono text-xs">{villaAdminUser.villa.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-gray-600">{booking.villaName}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(booking.checkIn)} - {formatDateTime(booking.checkOut)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent bookings found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    </AuthGuard>
  );
}