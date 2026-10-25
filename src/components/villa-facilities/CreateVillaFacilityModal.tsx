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
import styles from './CreateVillaFacilityModal.module.css';

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
    <div className={styles.div} style={{ paddingTop: '5vh' }}>
      <div className={styles.div2}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.div3}>
              <CardTitle className={styles.cardTitle}>
                <Sparkles className={styles.sparkles} />
                Add Villa Facilities
              </CardTitle>
              <button
                onClick={onClose}
                className={styles.button}
                disabled={createMutation.isPending}
              >
                <X className={styles.x} />
              </button>
            </div>
            <p className={styles.p}>
              Select facilities from the pool to add to your villa. Already added facilities are checked by default.
            </p>
          </CardHeader>

          <CardContent className={styles.cardContent}>
            {isLoading ? (
              <div className={styles.div4}>
                <Loader2 className={styles.loader2} />
              </div>
            ) : error ? (
              <div className={styles.div5}>
                <AlertTriangle className={styles.alertTriangle} />
                <h3 className={styles.h3}>Error Loading Facilities</h3>
                <p className={styles.p2}>
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
            ) : flattenedFacilities.length === 0 ? (
              <div className={styles.div5}>
                <AlertTriangle className={styles.alertTriangle2} />
                <h3 className={styles.h3}>No Facilities Available</h3>
                <p className={styles.p3}>
                  No facilities were found in the pool. This might be a data structure issue.
                </p>
                <details className={styles.details}>
                  <summary className={styles.summary}>Debug Info (Click to expand)</summary>
                  <pre className={styles.pre}>
                    {JSON.stringify(availableFacilitiesData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className={styles.div6}>
                {Object.entries(facilitiesByCategory).map(([categoryName, items]) => (
                  <div key={categoryName} className={styles.div7}>
                    <h3 className={styles.h32}>
                      {categoryName}
                    </h3>
                    <div className={styles.div8}>
                      {items.map(({ facility }) => {
                        const isChecked = selectedFacilityIds.has(facility.id);
                        return (
                          <label
                            key={facility.id}
                            className={styles.label}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleFacility(facility.id)}
                              className={styles.input}
                            />
                            <div className={styles.div9}>
                              <div className={styles.div10}>
                                {facility.name}
                              </div>
                              {facility.description && (
                                <div className={styles.div11}>
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

          <div className={styles.div12}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className={styles.div9}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={createMutation.isPending || isLoading}
              className={styles.button2}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className={styles.loader22} />
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
