'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePropertyRentable } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AlignLeft, ArrowLeft, Building2 } from 'lucide-react';

export const CreatePropertyRentablePage: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreatePropertyRentable();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: 'name' | 'description', value: string) => {
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
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      router.push('/property-rentables');
    } catch {
      setErrors({ general: 'Failed to create property rentable. Please try again.' });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Create Property Rentable</h1>
          <p className="mt-1 text-sm text-gray-500">Add a room or rentable unit to your villa.</p>
        </div>
      </div>

      <Card>
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
                disabled={createMutation.isPending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'rentable-name-error' : undefined}
              />
              {errors.name && <p id="rentable-name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
                disabled={createMutation.isPending}
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