'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyRentables, useUpdatePropertyRentable } from '@/hooks/api';
import { PropertyRentable } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { PropertyRentableGalleryManager } from './PropertyRentableGalleryManager';
import { AlertCircle, AlignLeft, ArrowLeft, Building2, ListOrdered, Loader2, Users } from 'lucide-react';
import styles from './EditPropertyRentablePage.module.css';

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
    <div className={styles.div}>
      <div className={styles.div2}>
        <button
          type="button"
          onClick={() => router.push('/property-rentables')}
          className={styles.button}
          aria-label="Back to property rentables"
          title="Back to property rentables"
        >
          <ArrowLeft className={styles.arrowLeft} />
        </button>
        <div>
          <h1 className={styles.h1}>Edit Property Rentable</h1>
          <p className={styles.p}>Update this rentable unit&apos;s details.</p>
        </div>
      </div>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            <Building2 className={styles.building2} />
            Rentable details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.general && (
              <div className={styles.div3}>
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="rentable-name" className={styles.label}>
                <Building2 className={styles.building22} />
                Name <span className={styles.span}>*</span>
              </label>
              <input
                id="rentable-name"
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className={`${styles.input} ${
                  errors.name ? styles.input2 : styles.input3
                }`}
                placeholder="e.g., Studio Suite, Garden Villa"
                disabled={updateMutation.isPending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'rentable-name-error' : undefined}
              />
              {errors.name && <p id="rentable-name-error" className={styles.p2}>{errors.name}</p>}
            </div>

            <div className={styles.div4}>
              <div>
                <label htmlFor="rentable-order" className={styles.label}>
                  <ListOrdered className={styles.building22} />
                  Display order <span className={styles.span}>*</span>
                </label>
                <input
                  id="rentable-order"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.order}
                  onChange={(event) => handleChange('order', event.target.value)}
                  className={`${styles.input} ${
                    errors.order ? styles.input2 : styles.input3
                  }`}
                  disabled={updateMutation.isPending}
                  aria-invalid={Boolean(errors.order)}
                  aria-describedby={errors.order ? 'rentable-order-error' : undefined}
                />
                {errors.order && <p id="rentable-order-error" className={styles.p2}>{errors.order}</p>}
              </div>

              <div>
                <label htmlFor="rentable-capacity" className={styles.label}>
                  <Users className={styles.building22} />
                  Guest capacity <span className={styles.span}>*</span>
                </label>
                <input
                  id="rentable-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.capacity}
                  onChange={(event) => handleChange('capacity', event.target.value)}
                  className={`${styles.input} ${
                    errors.capacity ? styles.input2 : styles.input3
                  }`}
                  disabled={updateMutation.isPending}
                  aria-invalid={Boolean(errors.capacity)}
                  aria-describedby={errors.capacity ? 'rentable-capacity-error' : undefined}
                />
                {errors.capacity && <p id="rentable-capacity-error" className={styles.p2}>{errors.capacity}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="rentable-description" className={styles.label}>
                <AlignLeft className={styles.building22} />
                Description <span className={styles.span}>*</span>
              </label>
              <textarea
                id="rentable-description"
                value={formData.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={6}
                className={`${styles.textarea} ${
                  errors.description ? styles.input2 : styles.input3
                }`}
                placeholder="Describe this rentable unit..."
                disabled={updateMutation.isPending}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'rentable-description-error' : undefined}
              />
              {errors.description && (
                <p id="rentable-description-error" className={styles.p2}>{errors.description}</p>
              )}
            </div>

            <div className={styles.div5}>
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
      <div className={styles.div6}>
        <Loader2 className={styles.loader2} />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className={styles.cardContent}>
          <AlertCircle className={styles.alertCircle} />
          <p className={styles.p3}>
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
        <CardContent className={styles.cardContent2}>
          <AlertCircle className={styles.alertCircle2} />
          <p className={styles.p4}>Property rentable not found</p>
          <Button variant="outline" onClick={() => router.push('/property-rentables')}>
            Back to property rentables
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <RentableEditForm key={rentable.id} rentable={rentable} />;
};