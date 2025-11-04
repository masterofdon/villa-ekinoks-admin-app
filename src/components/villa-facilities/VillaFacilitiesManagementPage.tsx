'use client';

import React, { useState } from 'react';
import { useVillaFacilityItems } from '@/hooks/api';
import { SimpleVillaFacilityItemView } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, AlertTriangle } from 'lucide-react';
import { CreateVillaFacilityModal } from './CreateVillaFacilityModal';

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

  const { 
    data: villaFacilityItems, 
    isLoading, 
    error,
    refetch 
  } = useVillaFacilityItems();

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    refetch(); // Refresh the facilities list when modal closes
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600" />
            Villa Facilities
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your villa&apos;s features and amenities
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Facilities
        </Button>
      </div>

      {/* Facilities Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Facilities</CardTitle>
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

      {/* Create Modal */}
      <CreateVillaFacilityModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        currentFacilities={villaFacilityItems || {}}
      />
    </div>
  );
};
