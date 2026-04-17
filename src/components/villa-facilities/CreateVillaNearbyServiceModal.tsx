'use client';

import React, { useState } from 'react';
import { useCreateVillaNearbyService } from '@/hooks/api';
import { VillaNearbyServiceType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, MapPin, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Add Nearby Service
              </CardTitle>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={createMutation.isPending}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Add a nearby service or point of interest for your villa guests.
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
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
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Marina Bay Restaurant"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={createMutation.isPending}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Distance */}
              <div>
                <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                  Distance <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="distance"
                    value={formData.distanceValue}
                    onChange={(e) => handleInputChange('distanceValue', e.target.value)}
                    placeholder="e.g., 2.5"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.distanceValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={createMutation.isPending}
                  />
                  <select
                    value={formData.distanceUnit}
                    onChange={(e) => handleInputChange('distanceUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={createMutation.isPending}
                  >
                    {DISTANCE_UNIT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.distanceValue && <p className="text-red-500 text-sm mt-1">{errors.distanceValue}</p>}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="e.g., 37.7749"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.latitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={createMutation.isPending}
                  />
                  {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="e.g., -122.4194"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.longitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={createMutation.isPending}
                  />
                  {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
                </div>
              </div>
            </form>
          </CardContent>

          <div className="border-t p-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
