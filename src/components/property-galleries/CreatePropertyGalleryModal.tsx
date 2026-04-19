'use client';

import React, { useState } from 'react';
import { useCreatePropertyGallery } from '@/hooks/api';
import { Create_PropertyGallery_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Images } from 'lucide-react';

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
    order: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreatePropertyGallery();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Gallery name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.order) {
      newErrors.order = 'Order is required';
    } else if (Number.isNaN(Number(formData.order)) || Number(formData.order) < 0) {
      newErrors.order = 'Order must be a non-negative number';
    }
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
        order: Number(formData.order),
      };
      await createMutation.mutateAsync(data);
      setFormData({ name: '', description: '', order: '' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Images className="h-5 w-5 text-blue-600" />
              Create Property Gallery
            </CardTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Gallery Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Living Room"
                className="mt-1"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this gallery"
                className="mt-1"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => handleChange('order', e.target.value)}
                placeholder="0"
                className="mt-1"
              />
              {errors.order && <p className="text-red-500 text-xs mt-1">{errors.order}</p>}
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm">{errors.submit}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
