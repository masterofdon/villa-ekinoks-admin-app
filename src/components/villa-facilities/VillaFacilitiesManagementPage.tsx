'use client';

import React, { useState } from 'react';
import { useVillaFacilityItems, useVillaNearbyServices, useDeleteVillaNearbyService } from '@/hooks/api';
import { SimpleVillaFacilityItemView, VillaNearbyService } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, AlertTriangle, MapPin, Trash2 } from 'lucide-react';
import { CreateVillaFacilityModal } from './CreateVillaFacilityModal';
import { CreateVillaNearbyServiceModal } from './CreateVillaNearbyServiceModal';
import styles from './VillaFacilitiesManagementPage.module.css';

interface FacilityCategoryDisplayProps {
  categoryName: string;
  facilities: SimpleVillaFacilityItemView[];
}

const FacilityCategoryDisplay: React.FC<FacilityCategoryDisplayProps> = ({ 
  categoryName, 
  facilities 
}) => {
  return (
    <div className={styles.div}>
      <h3 className={styles.h3}>
        {categoryName}
      </h3>
      <div className={styles.div2}>
        {facilities.map((facility, index) => (
          <div 
            key={`${categoryName}-${index}`}
            className={styles.div3}
          >
            <div className={styles.div4}></div>
            <span className={styles.span}>{facility.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VillaFacilitiesManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateNearbyServiceModalOpen, setIsCreateNearbyServiceModalOpen] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteNearbyService = useDeleteVillaNearbyService();

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

  const handleDeleteNearbyService = async (id: string) => {
    setDeletingServiceId(id);
    try {
      await deleteNearbyService.mutateAsync(id);
    } finally {
      setDeletingServiceId(null);
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.div5}>
        <div className={styles.div6}>
          <div className={styles.div7}></div>
          <div className={styles.div8}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.div5}>
        <Card>
          <CardContent className={styles.div5}>
            <div className={styles.div9}>
              <AlertTriangle className={styles.alertTriangle} />
              <h3 className={styles.h32}>Error Loading Villa Facilities</h3>
              <p className={styles.p}>
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
    <div className={styles.div10}>
      {/* Header */}
      <div className={styles.div11}>
        <h1 className={styles.h1}>
          <Sparkles className={styles.sparkles} />
          Villa Facilities
        </h1>
        <p className={styles.p2}>
          Manage your villa&apos;s features and amenities
        </p>
      </div>

      {/* Facilities Card */}
      <Card>
        <CardHeader>
          <div className={styles.div12}>
            <CardTitle>Current Facilities</CardTitle>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.button}
            >
              <Plus className={styles.plus} />
              Add Facilities
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasAnyFacilities ? (
            <div className={styles.div13}>
              <Sparkles className={styles.sparkles2} />
              <h3 className={styles.h32}>No Facilities Added</h3>
              <p className={styles.p}>
                You haven&apos;t added any facilities to your villa yet. Start by adding some from our facility pool.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.button}
              >
                <Plus className={styles.plus} />
                Add Your First Facilities
              </Button>
            </div>
          ) : (
            <div className={styles.div14}>
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
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.div12}>
            <CardTitle className={styles.cardTitle}>
              <MapPin className={styles.mapPin} />
              Villa Nearby Services
            </CardTitle>
            <Button
              onClick={() => setIsCreateNearbyServiceModalOpen(true)}
              className={styles.button}
            >
              <Plus className={styles.plus} />
              Add Nearby Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingNearbyServices ? (
            <div className={styles.div6}>
              <div className={styles.div15}></div>
              <div className={styles.div15}></div>
              <div className={styles.div15}></div>
            </div>
          ) : nearbyServicesError ? (
            <div className={styles.div13}>
              <AlertTriangle className={styles.alertTriangle} />
              <h3 className={styles.h32}>Error Loading Nearby Services</h3>
              <p className={styles.p}>
                {nearbyServicesError instanceof Error ? nearbyServicesError.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetchNearbyServices()}>
                Try Again
              </Button>
            </div>
          ) : !villaNearbyServices || villaNearbyServices.length === 0 ? (
            <div className={styles.div13}>
              <MapPin className={styles.sparkles2} />
              <h3 className={styles.h32}>No Nearby Services Added</h3>
              <p className={styles.p}>
                You haven&apos;t added any nearby services yet. Help your guests discover local attractions and amenities.
              </p>
              <Button
                onClick={() => setIsCreateNearbyServiceModalOpen(true)}
                className={styles.button}
              >
                <Plus className={styles.plus} />
                Add Your First Nearby Service
              </Button>
            </div>
          ) : (
            <div className={styles.div16}>
              {villaNearbyServices.map((service) => (
                <div
                  key={service.id}
                  className={styles.div17}
                >
                  {confirmDeleteId === service.id ? (
                    <div className={styles.div18}>
                      <p className={styles.p3}>Delete &ldquo;{service.name}&rdquo;?</p>
                      <p className={styles.p4}>This action cannot be undone.</p>
                      <div className={styles.div19}>
                        <button
                          onClick={() => handleDeleteNearbyService(service.id)}
                          disabled={deletingServiceId === service.id}
                          className={styles.button2}
                        >
                          {deletingServiceId === service.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingServiceId === service.id}
                          className={styles.button3}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.div20}>
                        <div className={styles.div21}>
                          <div className={styles.div22}>
                            <span className={styles.span2}>
                              {service.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h4 className={styles.h4}>{service.name}</h4>
                        </div>
                        <button
                          onClick={() => setConfirmDeleteId(service.id)}
                          className={styles.button4}
                          title="Delete nearby service"
                        >
                          <Trash2 className={styles.trash2} />
                        </button>
                      </div>
                      <div className={styles.div23}>
                        <p>📍 Distance: {service.distance}</p>
                        <p>🌍 Location: {service.location.latitude.toFixed(6)}, {service.location.longitude.toFixed(6)}</p>
                      </div>
                    </>
                  )}
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
