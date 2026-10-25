'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePropertyRentable } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AlignLeft, ArrowLeft, Building2, ListOrdered, Users } from 'lucide-react';
import styles from './CreatePropertyRentablePage.module.css';

export const CreatePropertyRentablePage: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreatePropertyRentable();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: '0',
    capacity: '1',
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
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: Number(formData.order),
        capacity: Number(formData.capacity),
      });
      router.push('/property-rentables');
    } catch {
      setErrors({ general: 'Failed to create property rentable. Please try again.' });
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
          <h1 className={styles.h1}>Create Property Rentable</h1>
          <p className={styles.p}>Add a room or rentable unit to your villa.</p>
        </div>
      </div>

      <Card>
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
                disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
                  disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create rentable'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};