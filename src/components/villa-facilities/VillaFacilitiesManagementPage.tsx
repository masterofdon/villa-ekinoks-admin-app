'use client';

import React, { useState } from 'react';
import { useVillaFacilityItems, useVillaNearbyServices } from '@/hooks/api';
import { SimpleVillaFacilityItemView, VillaNearbyService } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, AlertTriangle, MapPin } from 'lucide-react';
import { CreateVillaFacilityModal } from './CreateVillaFacilityModal';
import { CreateVillaNearbyServiceModal } from './CreateVillaNearbyServiceModal';

interface FacilityCategoryDisplayProps {
  categoryName: string;
  facilities: SimpleVillaFacilityItemView[];
}

const FacilityCategoryDisplay: React.FC<FacilityCategoryDisplayProps> = ({ 
  categoryName, 
  facilities 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
        {categoryName}
      </h3>
      <div className="space-y-2">
        {facilities.map((facility, index) => (
          <div 
            key={`${categoryName}-${index}`}
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
            <span className="text-gray-700 text-sm">{facility.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VillaFacilitiesManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateNearbyServiceModalOpen, setIsCreateNearbyServiceModalOpen] = useState(false);

  const { 
    data: villaFacilityItems, 
    isLoading, 
    error,
    refetch 
  } = useVillaFacilityItems();

  const { 
    data: villaNearbyServices, 
    isLoading: isLoadingNearbyServices, 
    error: nearbyServicesError,
    refetch: refetchNearbyServices 
  } = useVillaNearbyServices();

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    refetch(); // Refresh the facilities list when modal closes
  };

  const handleNearbyServiceModalClose = () => {
    setIsCreateNearbyServiceModalOpen(false);
    refetchNearbyServices(); // Refresh the nearby services list when modal closes
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Villa Facilities</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = villaFacilityItems ? Object.keys(villaFacilityItems) : [];
  const hasAnyFacilities = categories.length > 0 && categories.some(cat => villaFacilityItems![cat].length > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-blue-600" />
          Villa Facilities
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your villa&apos;s features and amenities
        </p>
      </div>

      {/* Facilities Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Facilities</CardTitle>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Facilities
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasAnyFacilities ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facilities Added</h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t added any facilities to your villa yet. Start by adding some from our facility pool.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Facilities
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((categoryName) => {
                const facilities = villaFacilityItems![categoryName];
                if (facilities.length === 0) return null;
                
                return (
                  <FacilityCategoryDisplay
                    key={categoryName}
                    categoryName={categoryName}
                    facilities={facilities}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Villa Nearby Services Card */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Villa Nearby Services
            </CardTitle>
            <Button
              onClick={() => setIsCreateNearbyServiceModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Nearby Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingNearbyServices ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ) : nearbyServicesError ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Nearby Services</h3>
              <p className="text-gray-600 mb-4">
                {nearbyServicesError instanceof Error ? nearbyServicesError.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetchNearbyServices()}>
                Try Again
              </Button>
            </div>
          ) : !villaNearbyServices || villaNearbyServices.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Nearby Services Added</h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t added any nearby services yet. Help your guests discover local attractions and amenities.
              </p>
              <Button
                onClick={() => setIsCreateNearbyServiceModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Nearby Service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {villaNearbyServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📍 Distance: {service.distance}</p>
                    <p>🌍 Location: {service.location.latitude.toFixed(6)}, {service.location.longitude.toFixed(6)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modals */}
      <CreateVillaFacilityModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        currentFacilities={villaFacilityItems || {}}
      />
      <CreateVillaNearbyServiceModal
        isOpen={isCreateNearbyServiceModalOpen}
        onClose={handleNearbyServiceModalClose}
      />
    </div>
  );
};
