'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useDashboardStats, useCurrentUser } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Building2, Calendar, DollarSign, Users, User } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: user } = useCurrentUser();

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
      title: 'Total Villas',
      value: stats?.totalVillas || 0,
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      title: 'Active Villas',
      value: stats?.activeVillas || 0,
      icon: Users,
      color: 'text-green-600',
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
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' 
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