'use client';

import React, { useState } from 'react';
import { useCreateVillaNearbyService } from '@/hooks/api';
import { VillaNearbyServiceType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, MapPin, Loader2 } from 'lucide-react';
import styles from './CreateVillaNearbyServiceModal.module.css';

interface CreateVillaNearbyServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_TYPE_OPTIONS: { value: VillaNearbyServiceType; label: string }[] = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'SHOPPING_MALL', label: 'Shopping Mall' },
  { value: 'PARK', label: 'Park' },
  { value: 'BEACH', label: 'Beach' },
  { value: 'AIRPORT', label: 'Airport' },
  { value: 'TRAIN_STATION', label: 'Train Station' },
  { value: 'BUS_STOP', label: 'Bus Stop' },
];

const DISTANCE_UNIT_OPTIONS = [
  { value: 'km', label: 'km' },
  { value: 'mi', label: 'mi' },
];

export const CreateVillaNearbyServiceModal: React.FC<CreateVillaNearbyServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    type: '' as VillaNearbyServiceType,
    name: '',
    distanceValue: '',
    distanceUnit: 'km',
    latitude: '',
    longitude: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateVillaNearbyService();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Service type is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.distanceValue.trim()) {
      newErrors.distanceValue = 'Distance is required';
    } else if (isNaN(Number(formData.distanceValue)) || Number(formData.distanceValue) <= 0) {
      newErrors.distanceValue = 'Distance must be a positive number';
    }
    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        type: formData.type,
        name: formData.name.trim(),
        distance: `${formData.distanceValue} ${formData.distanceUnit}`,
        location: {
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        },
      });

      // Reset form and close modal
      setFormData({
        type: '' as VillaNearbyServiceType,
        name: '',
        distanceValue: '',
        distanceUnit: 'km',
        latitude: '',
        longitude: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create nearby service:', error);
      // Error handling is done by the mutation
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setFormData({
        type: '' as VillaNearbyServiceType,
        name: '',
        distanceValue: '',
        distanceUnit: 'km',
        latitude: '',
        longitude: '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.div}>
      <div className={styles.div2}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.div3}>
              <CardTitle className={styles.cardTitle}>
                <MapPin className={styles.mapPin} />
                Add Nearby Service
              </CardTitle>
              <button
                onClick={handleClose}
                className={styles.button}
                disabled={createMutation.isPending}
              >
                <X className={styles.x} />
              </button>
            </div>
            <p className={styles.p}>
              Add a nearby service or point of interest for your villa guests.
            </p>
          </CardHeader>

          <CardContent className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Service Type */}
              <div>
                <label htmlFor="type" className={styles.label}>
                  Service Type <span className={styles.span}>*</span>
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`${styles.select} ${
                    errors.type ? styles.select2 : styles.select3
                  }`}
                  disabled={createMutation.isPending}
                >
                  <option value="">Select a type</option>
                  {SERVICE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.type && <p className={styles.p2}>{errors.type}</p>}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className={styles.label}>
                  Name <span className={styles.span}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Marina Bay Restaurant"
                  className={`${styles.select} ${
                    errors.name ? styles.select2 : styles.select3
                  }`}
                  disabled={createMutation.isPending}
                />
                {errors.name && <p className={styles.p2}>{errors.name}</p>}
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="distance" className={styles.label}>
                  Distance <span className={styles.span}>*</span>
                </label>
                <div className={styles.div4}>
                  <input
                    type="text"
                    id="distance"
                    value={formData.distanceValue}
                    onChange={(e) => handleInputChange('distanceValue', e.target.value)}
                    placeholder="e.g., 2.5"
                    className={`${styles.input} ${
                      errors.distanceValue ? styles.select2 : styles.select3
                    }`}
                    disabled={createMutation.isPending}
                  />
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => handleInputChange('distanceUnit', e.target.value)}
                    className={styles.select4}
                    disabled={createMutation.isPending}
                  >
                    {DISTANCE_UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.distanceValue && <p className={styles.p2}>{errors.distanceValue}</p>}
              </div>

              {/* Location */}
              <div className={styles.div5}>
                <div>
                  <label htmlFor="latitude" className={styles.label}>
                    Latitude <span className={styles.span}>*</span>
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="e.g., 37.7749"
                    className={`${styles.select} ${
                      errors.latitude ? styles.select2 : styles.select3
                    }`}
                    disabled={createMutation.isPending}
                  />
                  {errors.latitude && <p className={styles.p2}>{errors.latitude}</p>}
                </div>
                <div>
                  <label htmlFor="longitude" className={styles.label}>
                    Longitude <span className={styles.span}>*</span>
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="e.g., -122.4194"
                    className={`${styles.select} ${
                      errors.longitude ? styles.select2 : styles.select3
                    }`}
                    disabled={createMutation.isPending}
                  />
                  {errors.longitude && <p className={styles.p2}>{errors.longitude}</p>}
                </div>
              </div>
            </form>
          </CardContent>

          <div className={styles.div6}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className={styles.button2}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className={styles.button3}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className={styles.loader2} />
                  Creating...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
