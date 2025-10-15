'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDiscountCodes, useUpdateDiscountCodeStatus } from '@/hooks/api';
import { DiscountCode, DiscountType, DiscountCodeStatus, DiscountCodeUsageType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Percent, DollarSign, Clock, Users, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { CreateDiscountCodeModal } from './CreateDiscountCodeModal';


const DiscountTypeIcon: React.FC<{ type: DiscountType }> = ({ type }) => {
  if (type === 'PERCENTAGE') {
    return <Percent className="h-4 w-4 text-blue-600" />;
  }
  return <DollarSign className="h-4 w-4 text-green-600" />;
};

const DiscountStatusBadge: React.FC<{ status: DiscountCodeStatus }> = ({ status }) => {
  const getStatusColor = (status: DiscountCodeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: DiscountCodeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-3 w-3" />;
      case 'INACTIVE':
        return <XCircle className="h-3 w-3" />;
      case 'EXPIRED':
        return <Clock className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

const StatusDropdown: React.FC<{ 
  discountCode: DiscountCode; 
  onStatusChange: (newStatus: DiscountCodeStatus) => void;
  isUpdating: boolean;
}> = ({ discountCode, onStatusChange, isUpdating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const statusOptions: DiscountCodeStatus[] = ['ACTIVE', 'INACTIVE', 'EXPIRED'];
  
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
  
  const handleStatusChange = (newStatus: DiscountCodeStatus) => {
    if (newStatus !== discountCode.status) {
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
        <DiscountStatusBadge status={discountCode.status} />
        <ChevronDown className="h-3 w-3" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                status === discountCode.status ? 'bg-blue-50' : ''
              }`}
            >
              <DiscountStatusBadge status={status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UsageTypeBadge: React.FC<{ usageType: DiscountCodeUsageType }> = ({ usageType }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      usageType === 'SINGLE_USE' 
        ? 'bg-orange-100 text-orange-800 border-orange-200' 
        : 'bg-blue-100 text-blue-800 border-blue-200'
    }`}>
      <Users className="h-3 w-3" />
      {usageType === 'SINGLE_USE' ? 'Single Use' : 'Multi Use'}
    </span>
  );
};

const DiscountCodeCard: React.FC<{ 
  discountCode: DiscountCode;
  onStatusChange: (discountCodeId: string, newStatus: DiscountCodeStatus) => void;
  isUpdating: boolean;
}> = ({ discountCode, onStatusChange, isUpdating }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatValue = (value: string, type: DiscountType) => {
    if (type === 'PERCENTAGE') {
      return `${value}%`;
    }
    return `$${value}`;
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-lg font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {discountCode.code}
              </code>
              <DiscountTypeIcon type={discountCode.discounttype} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatValue(discountCode.value, discountCode.discounttype)}
              </span>
              <span className="text-sm text-gray-600">
                {discountCode.discounttype === 'PERCENTAGE' ? 'off' : 'discount'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusDropdown 
              discountCode={discountCode}
              onStatusChange={(newStatus) => onStatusChange(discountCode.id, newStatus)}
              isUpdating={isUpdating}
            />
            <UsageTypeBadge usageType={discountCode.usagetype} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span>
            <div>{formatDate(discountCode.timestamps.creationdate)}</div>
          </div>
          <div>
            <span className="font-medium">Expires:</span>
            <div>
              {discountCode.timestamps.expirationdate 
                ? formatDate(discountCode.timestamps.expirationdate)
                : 'Never'
              }
            </div>
          </div>
          <div>
            <span className="font-medium">Created by:</span>
            <div>
              {discountCode.createdby.personalinfo.firstname} {discountCode.createdby.personalinfo.lastname}
            </div>
          </div>
          <div>
            <span className="font-medium">Type:</span>
            <div className="capitalize">{discountCode.discounttype.toLowerCase().replace('_', ' ')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DiscountCodesManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: discountCodesResponse, isLoading, error, refetch } = useDiscountCodes();
  const updateStatusMutation = useUpdateDiscountCodeStatus();

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch(); // Refetch the discount codes list
  };

  const handleStatusChange = async (discountCodeId: string, newStatus: DiscountCodeStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        discountCodeId,
        statusData: { status: newStatus }
      });
    } catch (error) {
      alert(`Failed to update discount code status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discount codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading discount codes</p>
          </div>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const discountCodes = discountCodesResponse?.codes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="text-gray-600 mt-1">
            Manage discount codes for your villa bookings
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Discount Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900">{discountCodes.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-green-900">
                  {discountCodes.filter(code => code.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Percentage Codes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {discountCodes.filter(code => code.discounttype === 'PERCENTAGE').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Fixed Amount</p>
                <p className="text-2xl font-bold text-green-900">
                  {discountCodes.filter(code => code.discounttype === 'FIXED_AMOUNT').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Discount Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {discountCodes.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discount codes yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first discount code to start offering promotions to guests.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Discount Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {discountCodes.map((discountCode) => (
                <DiscountCodeCard 
                  key={discountCode.id} 
                  discountCode={discountCode}
                  onStatusChange={handleStatusChange}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Discount Code Modal */}
      <CreateDiscountCodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};