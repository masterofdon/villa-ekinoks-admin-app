'use client';

import React, { useState } from 'react';
import { useCreatePropertyGallery } from '@/hooks/api';
import { Create_PropertyGallery_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Images } from 'lucide-react';
import styles from './CreatePropertyGalleryModal.module.css';

interface CreatePropertyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePropertyGalleryModal: React.FC<CreatePropertyGalleryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreatePropertyGallery();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Gallery name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data: Create_PropertyGallery_WC_MLS_XAction = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };
      await createMutation.mutateAsync(data);
      setFormData({ name: '', description: '' });
      setErrors({});
      onSuccess();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create gallery',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.div}>
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.div2}>
            <CardTitle className={styles.cardTitle}>
              <Images className={styles.images} />
              Create Property Gallery
            </CardTitle>
            <button onClick={onClose} className={styles.button}>
              <X className={styles.x} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <Label htmlFor="name">Gallery Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Living Room"
                className={styles.input}
              />
              {errors.name && <p className={styles.p}>{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this gallery"
                className={styles.input}
              />
              {errors.description && (
                <p className={styles.p}>{errors.description}</p>
              )}
            </div>

            {errors.submit && (
              <p className={styles.p2}>{errors.submit}</p>
            )}

            <div className={styles.div3}>
              <Button
                type="button"
                onClick={onClose}
                className={styles.button2}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className={styles.button3}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Gallery'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
