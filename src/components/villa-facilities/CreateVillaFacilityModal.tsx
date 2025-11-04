'use client';

import React, { useState, useEffect } from 'react';
import { useAvailableVillaFacilities, useCreateVillaFacilityItem } from '@/hooks/api';
import { 
  Get_VillaFacilityItems_WC_MLS_XAction_Response, 
  VillaFacilityCategoryMapView,
  VillaFacilitySimpleView 
} from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

interface CreateVillaFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacilities: Get_VillaFacilityItems_WC_MLS_XAction_Response;
}

interface FacilityWithCategory {
  facility: VillaFacilitySimpleView;
  categoryName: string;
  priority: number;
}

export const CreateVillaFacilityModal: React.FC<CreateVillaFacilityModalProps> = ({
  isOpen,
  onClose,
  currentFacilities,
}) => {
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<Set<string>>(new Set());
  
  const { data: availableFacilitiesData, isLoading, error } = useAvailableVillaFacilities();
  const createMutation = useCreateVillaFacilityItem();

  // Initialize selected facilities based on current facilities
  useEffect(() => {
    if (isOpen && currentFacilities) {
      const currentIds = new Set<string>();
      
      // Extract all facility names from current facilities
      Object.values(currentFacilities).forEach((facilities) => {
        facilities.forEach((facility) => {
          // We'll match by name since we don't have IDs in SimpleVillaFacilityItemView
          // This is a temporary solution - we'll need to match against available facilities
        });
      });
      
      setSelectedFacilityIds(currentIds);
    }
  }, [isOpen, currentFacilities]);

  // Flatten the available facilities structure for easier rendering
  const flattenedFacilities: FacilityWithCategory[] = React.useMemo(() => {
    if (!availableFacilitiesData) return [];
    
    const flattened: FacilityWithCategory[] = [];
    
    // The API returns { categoryName: { id, priority, facilities: [] } }
    Object.entries(availableFacilitiesData).forEach(([categoryName, categoryData]) => {
      const categoryMap = categoryData as VillaFacilityCategoryMapView;
      
      if (categoryMap.facilities && Array.isArray(categoryMap.facilities)) {
        categoryMap.facilities.forEach((facility: VillaFacilitySimpleView) => {
          flattened.push({
            facility,
            categoryName,
            priority: categoryMap.priority,
          });
        });
      }
    });
    
    // Sort by category priority, then by facility priority
    return flattened.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.facility.priority - b.facility.priority;
    });
  }, [availableFacilitiesData]);

  // Check if a facility is already added based on name matching
  const isFacilityAlreadyAdded = (facilityName: string): boolean => {
    return Object.values(currentFacilities).some((facilities) =>
      facilities.some((f) => f.name === facilityName)
    );
  };

  // Initialize selected facilities with already added ones
  useEffect(() => {
    if (isOpen && flattenedFacilities.length > 0) {
      const alreadyAdded = new Set<string>();
      flattenedFacilities.forEach(({ facility }) => {
        if (isFacilityAlreadyAdded(facility.name)) {
          alreadyAdded.add(facility.id);
        }
      });
      setSelectedFacilityIds(alreadyAdded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flattenedFacilities]);

  const handleToggleFacility = (facilityId: string) => {
    setSelectedFacilityIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(facilityId)) {
        newSet.delete(facilityId);
      } else {
        newSet.add(facilityId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      // Get all selected facilities (including those already added)
      const selectedFacilities = flattenedFacilities.filter(
        ({ facility }) => selectedFacilityIds.has(facility.id)
      );

      // Extract facility IDs
      const facilityIds = selectedFacilities.map(({ facility }) => facility.id);

      // Create facility items with object containing array of IDs
      if (facilityIds.length > 0) {
        await createMutation.mutateAsync({ villafacilityids: facilityIds });
      }

      onClose();
    } catch (error) {
      console.error('Failed to add villa facilities:', error);
    }
  };

  if (!isOpen) return null;

  // Group flattened facilities by category for display
  const facilitiesByCategory = flattenedFacilities.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, FacilityWithCategory[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Add Villa Facilities
              </CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={createMutation.isPending}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Select facilities from the pool to add to your villa. Already added facilities are checked by default.
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Facilities</h3>
                <p className="text-gray-600">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            ) : flattenedFacilities.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facilities Available</h3>
                <p className="text-gray-600 mb-4">
                  No facilities were found in the pool. This might be a data structure issue.
                </p>
                <details className="text-left bg-gray-50 p-4 rounded">
                  <summary className="cursor-pointer font-medium">Debug Info (Click to expand)</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(availableFacilitiesData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(facilitiesByCategory).map(([categoryName, items]) => (
                  <div key={categoryName} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {categoryName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(({ facility }) => {
                        const isChecked = selectedFacilityIds.has(facility.id);
                        return (
                          <label
                            key={facility.id}
                            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleFacility(facility.id)}
                              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {facility.name}
                              </div>
                              {facility.description && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {facility.description}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="border-t p-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={createMutation.isPending || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Facilities'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
