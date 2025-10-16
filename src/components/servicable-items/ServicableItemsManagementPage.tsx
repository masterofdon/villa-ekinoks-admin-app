'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useServicableItems, useUpdateServicableItemStatus, useDeleteServicableItem } from '@/hooks/api';
import { ServicableItem, ServicableItemStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Package, DollarSign, Hash, CheckCircle, XCircle, ChevronDown, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { CreateServicableItemModal } from './CreateServicableItemModal';

const ServicableItemStatusIcon: React.FC<{ status: ServicableItemStatus }> = ({ status }) => {
  if (status === 'ACTIVE') {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  }
  return <XCircle className="h-4 w-4 text-red-600" />;
};

const ServicableItemStatusBadge: React.FC<{ status: ServicableItemStatus }> = ({ status }) => {
  const getStatusColor = (status: ServicableItemStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      <ServicableItemStatusIcon status={status} />
      {status}
    </span>
  );
};

const StatusDropdown: React.FC<{ 
  servicableItem: ServicableItem; 
  onStatusChange: (newStatus: ServicableItemStatus) => void;
  isUpdating: boolean;
}> = ({ servicableItem, onStatusChange, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const statusOptions: ServicableItemStatus[] = ['ACTIVE', 'INACTIVE'];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const handleStatusChange = (newStatus: ServicableItemStatus) => {
    if (newStatus !== servicableItem.status) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ServicableItemStatusBadge status={servicableItem.status} />
        <ChevronDown className="h-3 w-3" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                status === servicableItem.status ? 'bg-blue-50' : ''
              }`}
            >
              <ServicableItemStatusBadge status={status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  servicableItem: ServicableItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ isOpen, servicableItem, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen || !servicableItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Serviceable Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete &ldquo;{servicableItem.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ServicableItemCard: React.FC<{
  servicableItem: ServicableItem;
  onStatusChange: (newStatus: ServicableItemStatus) => void;
  onDelete: () => void;
  isUpdating: boolean;
}> = ({ servicableItem, onStatusChange, onDelete, isUpdating }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {servicableItem.iconlink ? (
              <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                <Image 
                  src={servicableItem.iconlink} 
                  alt={servicableItem.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
            ) : null}
            <div className={`w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center ${servicableItem.iconlink ? 'hidden' : ''}`}>
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {servicableItem.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {servicableItem.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {servicableItem.price.amount} {servicableItem.price.currency}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  {servicableItem.unit}
                </span>
                <span>
                  Qty: {servicableItem.minimum}-{servicableItem.maximum}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDropdown 
              servicableItem={servicableItem}
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
            />
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ServicableItemsManagementPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ServicableItem | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const { 
    data: servicableItemsPage, 
    isLoading, 
    error,
    refetch 
  } = useServicableItems(currentPage, pageSize);
  
  const updateStatusMutation = useUpdateServicableItemStatus();
  const deleteItemMutation = useDeleteServicableItem();

  const handleStatusChange = async (servicableItem: ServicableItem, newStatus: ServicableItemStatus) => {
    setUpdatingItemId(servicableItem.id);
    try {
      await updateStatusMutation.mutateAsync({
        servicableItemId: servicableItem.id,
        statusData: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update serviceable item status:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItemMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete serviceable item:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Serviceable Items</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const servicableItems = servicableItemsPage?.content || [];
  const totalPages = servicableItemsPage?.totalPages || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-blue-600" />
            Serviceable Items
          </h1>
          <p className="text-gray-600 mt-1">
            Manage additional services and amenities for your villa
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Stats Card */}
      {servicableItemsPage && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{servicableItemsPage.totalElements}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {servicableItems.filter(item => item.status === 'ACTIVE').length}
                </div>
                <div className="text-sm text-gray-600">Active Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {servicableItems.filter(item => item.status === 'INACTIVE').length}
                </div>
                <div className="text-sm text-gray-600">Inactive Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalPages}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Serviceable Items List */}
      {servicableItems.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Serviceable Items</h3>
              <p className="text-gray-600 mb-4">
                You haven&rsquo;t created any serviceable items yet. Add your first item to get started.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {servicableItems.map((servicableItem) => (
            <ServicableItemCard
              key={servicableItem.id}
              servicableItem={servicableItem}
              onStatusChange={(newStatus) => handleStatusChange(servicableItem, newStatus)}
              onDelete={() => setItemToDelete(servicableItem)}
              isUpdating={updatingItemId === servicableItem.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i;
              } else if (currentPage < 3) {
                pageNumber = i;
              } else if (currentPage >= totalPages - 3) {
                pageNumber = totalPages - 5 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "primary" : "outline"}
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10 h-10"
                >
                  {pageNumber + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <CreateServicableItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        servicableItem={itemToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
        isDeleting={deleteItemMutation.isPending}
      />
    </div>
  );
};