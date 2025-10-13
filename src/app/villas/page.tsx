'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useVillas, useDeleteVilla, useToggleVillaStatus } from '@/hooks/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Edit, Eye, Trash2, Plus, MapPin, Users, Bed, Bath, Building2 } from 'lucide-react';

export default function VillasPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: villasData, isLoading, error } = useVillas(currentPage);
  const deleteVillaMutation = useDeleteVilla();
  const toggleStatusMutation = useToggleVillaStatus();

  const handleDelete = async (villaId: string) => {
    if (window.confirm('Are you sure you want to delete this villa?')) {
      try {
        await deleteVillaMutation.mutateAsync(villaId);
      } catch (error) {
        console.error('Failed to delete villa:', error);
      }
    }
  };

  const handleToggleStatus = async (villaId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(villaId);
    } catch (error) {
      console.error('Failed to toggle villa status:', error);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading villas...</div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-red-600">Failed to load villas</div>
        </div>
      </Sidebar>
    );
  }

  return (
    <AuthGuard>
      <Sidebar>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Villas</h1>
              <p className="text-gray-600">Manage your villa listings</p>
            </div>
          <Link href="/villa-management/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add New Villa</span>
            </Button>
          </Link>
        </div>

        {villasData?.data && villasData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {villasData.data.map((villa) => (
                <Card key={villa.id} className="overflow-hidden">
                  <div className="relative">
                    {villa.images && villa.images.length > 0 ? (
                      <img
                        src={villa.images[0]}
                        alt={villa.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        villa.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {villa.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{villa.name}</h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{villa.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{villa.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        <span>{villa.bedrooms} beds</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        <span>{villa.bathrooms} baths</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-primary mb-4">
                      {formatCurrency(villa.pricePerNight)}/night
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/villa-management/${villa.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(villa.id)}
                        disabled={toggleStatusMutation.isPending}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {villa.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(villa.id)}
                        disabled={deleteVillaMutation.isPending}
                        className="flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {villasData.pagination && villasData.pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4">
                  Page {villasData.pagination.page} of {villasData.pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === villasData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No villas found</h3>
                <p className="mb-4">Get started by adding your first villa.</p>
                <Link href="/villa-management/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Villa
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Sidebar>
    </AuthGuard>
  );
}