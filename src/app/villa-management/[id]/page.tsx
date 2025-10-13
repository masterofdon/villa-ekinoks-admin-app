'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useVilla, useCreateVilla, useUpdateVilla } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const villaSchema = z.object({
  name: z.string().min(1, 'Villa name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  pricePerNight: z.number().min(0, 'Price must be positive'),
  maxGuests: z.number().min(1, 'Max guests must be at least 1'),
  bedrooms: z.number().min(1, 'Bedrooms must be at least 1'),
  bathrooms: z.number().min(1, 'Bathrooms must be at least 1'),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
});

type VillaFormData = z.infer<typeof villaSchema>;

export default function VillaManagementPage() {
  const router = useRouter();
  const params = useParams();
  const villaId = params?.id as string;
  const isEdit = villaId && villaId !== 'new';

  const { data: villa, isLoading: isLoadingVilla } = useVilla(villaId || '');
  
  const createVillaMutation = useCreateVilla();
  const updateVillaMutation = useUpdateVilla();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VillaFormData>({
    resolver: zodResolver(villaSchema),
    defaultValues: {
      amenities: [],
      images: [],
    },
  });

  React.useEffect(() => {
    if (villa && isEdit) {
      setValue('name', villa.publicinfo.name);
      setValue('description', villa.publicinfo.description);
      setValue('location', villa.publicinfo.location);
      setValue('pricePerNight', villa.pricing.pricingranges[0]?.pricepernight.amount || 0);
      setValue('maxGuests', villa.publicinfo.maxGuests);
      setValue('bedrooms', villa.publicinfo.bedrooms);
      setValue('bathrooms', villa.publicinfo.bathrooms);
      setValue('amenities', villa.publicinfo.amenities);
      setValue('images', villa.publicinfo.images);
    }
  }, [villa, isEdit, setValue]);

  const onSubmit = async (data: VillaFormData) => {
    try {
      if (isEdit) {
        await updateVillaMutation.mutateAsync({
          id: villaId,
          data,
        });
      } else {
        await createVillaMutation.mutateAsync(data);
      }
      router.push('/villas');
    } catch (error) {
      console.error('Failed to save villa:', error);
    }
  };

  const amenitiesValue = watch('amenities') || [];
  const imagesValue = watch('images') || [];

  const addAmenity = () => {
    const amenityInput = document.getElementById('new-amenity') as HTMLInputElement;
    if (amenityInput?.value.trim()) {
      setValue('amenities', [...amenitiesValue, amenityInput.value.trim()]);
      amenityInput.value = '';
    }
  };

  const removeAmenity = (index: number) => {
    setValue('amenities', amenitiesValue.filter((_, i) => i !== index));
  };

  const addImage = () => {
    const imageInput = document.getElementById('new-image') as HTMLInputElement;
    if (imageInput?.value.trim()) {
      setValue('images', [...imagesValue, imageInput.value.trim()]);
      imageInput.value = '';
    }
  };

  const removeImage = (index: number) => {
    setValue('images', imagesValue.filter((_, i) => i !== index));
  };

  if (isEdit && isLoadingVilla) {
    return (
      <AuthGuard>
        <Sidebar>
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Loading villa...</div>
          </div>
        </Sidebar>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Sidebar>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Villa' : 'Add New Villa'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update villa information' : 'Create a new villa listing'}
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Villa Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Villa Name</Label>
                  <Input
                    {...register('name')}
                    id="name"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    {...register('location')}
                    id="location"
                    className="mt-1"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pricePerNight">Price per Night ($)</Label>
                  <Input
                    {...register('pricePerNight', { valueAsNumber: true })}
                    id="pricePerNight"
                    type="number"
                    step="0.01"
                    className="mt-1"
                  />
                  {errors.pricePerNight && (
                    <p className="mt-1 text-sm text-red-600">{errors.pricePerNight.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxGuests">Max Guests</Label>
                  <Input
                    {...register('maxGuests', { valueAsNumber: true })}
                    id="maxGuests"
                    type="number"
                    className="mt-1"
                  />
                  {errors.maxGuests && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxGuests.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    {...register('bedrooms', { valueAsNumber: true })}
                    id="bedrooms"
                    type="number"
                    className="mt-1"
                  />
                  {errors.bedrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    {...register('bathrooms', { valueAsNumber: true })}
                    id="bathrooms"
                    type="number"
                    className="mt-1"
                  />
                  {errors.bathrooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <Label>Amenities</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="new-amenity"
                      placeholder="Add amenity..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={addAmenity} variant="outline">
                      Add
                    </Button>
                  </div>
                  {amenitiesValue.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {amenitiesValue.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Images</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      id="new-image"
                      placeholder="Add image URL..."
                      className="flex-1"
                    />
                    <Button type="button" onClick={addImage} variant="outline">
                      Add
                    </Button>
                  </div>
                  {imagesValue.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {imagesValue.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Villa image ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={createVillaMutation.isPending || updateVillaMutation.isPending}
                >
                  {createVillaMutation.isPending || updateVillaMutation.isPending
                    ? 'Saving...'
                    : isEdit
                    ? 'Update Villa'
                    : 'Create Villa'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/villas')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Sidebar>
    </AuthGuard>
  );
}