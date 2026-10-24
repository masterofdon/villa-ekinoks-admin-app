'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyRentables, useUpdatePropertyRentable } from '@/hooks/api';
import { PropertyRentable } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { PropertyRentableGalleryManager } from './PropertyRentableGalleryManager';
import { AlertCircle, AlignLeft, ArrowLeft, Building2, ListOrdered, Loader2, Users } from 'lucide-react';

interface EditPropertyRentablePageProps {
  rentableId: string;
}

const RentableEditForm: React.FC<{ rentable: PropertyRentable }> = ({ rentable }) => {
  const router = useRouter();
  const updateMutation = useUpdatePropertyRentable();
  const [formData, setFormData] = useState({
    name: rentable.name,
    description: rentable.description,
    order: String(rentable.order ?? 0),
    capacity: String(rentable.capacity ?? 1),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field] || errors.general) {
      setErrors((current) => ({ ...current, [field]: '', general: '' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors: Record<string, string> = {};
    if (!formData.name.trim()) validationErrors.name = 'Name is required';
    if (!formData.description.trim()) validationErrors.description = 'Description is required';
    if (!formData.order.trim() || !Number.isInteger(Number(formData.order)) || Number(formData.order) < 0) {
      validationErrors.order = 'Order must be a non-negative whole number';
    }
    if (!formData.capacity.trim() || !Number.isInteger(Number(formData.capacity)) || Number(formData.capacity) < 1) {
      validationErrors.capacity = 'Capacity must be a positive whole number';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await updateMutation.mutateAsync({
        id: rentable.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          order: Number(formData.order),
          capacity: Number(formData.capacity),
        },
      });
      router.push('/property-rentables');
    } catch {
      setErrors({ general: 'Failed to update property rentable. Please try again.' });
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/property-rentables')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
          aria-label="Back to property rentables"
          title="Back to property rentables"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Property Rentable</h1>
          <p className="mt-1 text-sm text-gray-500">Update this rentable unit&apos;s details.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Rentable details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="rentable-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                <Building2 className="mr-1.5 inline h-4 w-4" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="rentable-name"
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Studio Suite, Garden Villa"
                disabled={updateMutation.isPending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'rentable-name-error' : undefined}
              />
              {errors.name && <p id="rentable-name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="rentable-order" className="mb-1.5 block text-sm font-medium text-gray-700">
                  <ListOrdered className="mr-1.5 inline h-4 w-4" />
                  Display order <span className="text-red-500">*</span>
                </label>
                <input
                  id="rentable-order"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.order}
                  onChange={(event) => handleChange('order', event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.order ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={updateMutation.isPending}
                  aria-invalid={Boolean(errors.order)}
                  aria-describedby={errors.order ? 'rentable-order-error' : undefined}
                />
                {errors.order && <p id="rentable-order-error" className="mt-1 text-xs text-red-500">{errors.order}</p>}
              </div>

              <div>
                <label htmlFor="rentable-capacity" className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Users className="mr-1.5 inline h-4 w-4" />
                  Guest capacity <span className="text-red-500">*</span>
                </label>
                <input
                  id="rentable-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.capacity}
                  onChange={(event) => handleChange('capacity', event.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={updateMutation.isPending}
                  aria-invalid={Boolean(errors.capacity)}
                  aria-describedby={errors.capacity ? 'rentable-capacity-error' : undefined}
                />
                {errors.capacity && <p id="rentable-capacity-error" className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="rentable-description" className="mb-1.5 block text-sm font-medium text-gray-700">
                <AlignLeft className="mr-1.5 inline h-4 w-4" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rentable-description"
                value={formData.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={6}
                className={`w-full resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe this rentable unit..."
                disabled={updateMutation.isPending}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'rentable-description-error' : undefined}
              />
              {errors.description && (
                <p id="rentable-description-error" className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/property-rentables')}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PropertyRentableGalleryManager rentable={rentable} />
    </div>
  );
};

export const EditPropertyRentablePage: React.FC<EditPropertyRentablePageProps> = ({ rentableId }) => {
  const router = useRouter();
  const { data: rentables, isLoading, isError, error } = usePropertyRentables();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Failed to load property rentable.{' '}
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const rentable = rentables?.find((item) => item.id === rentableId);

  if (!rentable) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
          <AlertCircle className="h-10 w-10 text-gray-300" />
          <p className="font-medium">Property rentable not found</p>
          <Button variant="outline" onClick={() => router.push('/property-rentables')}>
            Back to property rentables
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <RentableEditForm key={rentable.id} rentable={rentable} />;
};