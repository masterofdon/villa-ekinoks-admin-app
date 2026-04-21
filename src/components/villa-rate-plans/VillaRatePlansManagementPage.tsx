'use client';

import React, { useState, useCallback } from 'react';
import { useVillaRatePlans, useDeleteVillaRatePlan } from '@/hooks/api';
import { 
  VillaRatePlan, 
  VillaRatePlanConditionType, 
  VillaRatePlanConditionOperator, 
  VillaRatePlanApplicationType, 
  VillaRatePlanApplicationValueType 
} from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Calculator, Trash2, Calendar, Users, Clock, DollarSign, Percent } from 'lucide-react';
import { CreateVillaRatePlanModal } from './CreateVillaRatePlanModal';
import { notification, Modal } from 'antd';

const ConditionTypeIcon: React.FC<{ type: VillaRatePlanConditionType }> = ({ type }) => {
  if (type === 'NUMBEROFGUESTS') {
    return <Users className="h-4 w-4 text-blue-600" />;
  }
  return <Clock className="h-4 w-4 text-green-600" />;
};

const ApplicationValueTypeIcon: React.FC<{ type: VillaRatePlanApplicationValueType }> = ({ type }) => {
  if (type === 'PERCENTAGE') {
    return <Percent className="h-4 w-4 text-purple-600" />;
  }
  return <DollarSign className="h-4 w-4 text-green-600" />;
};

const formatConditionOperator = (operator: VillaRatePlanConditionOperator): string => {
  switch (operator) {
    case 'EQUALS':
      return 'equals';
    case 'GREATER_THAN':
      return 'greater than';
    case 'LESS_THAN':
      return 'less than';
    default:
      return operator;
  }
};

const formatApplicationType = (type: VillaRatePlanApplicationType): string => {
  switch (type) {
    case 'PERGUEST':
      return 'per guest';
    case 'PERDAY':
      return 'per day';
    case 'PERGUESTPERDAY':
      return 'per guest per day';
    default:
      return type;
  }
};

const formatConditionType = (type: VillaRatePlanConditionType): string => {
  switch (type) {
    case 'NUMBEROFGUESTS':
      return 'number of guests';
    case 'NUMBEROFNIGHTS':
      return 'number of nights';
    default:
      return type;
  }
};

const formatDateRange = (startPeriod: string, endPeriod: string): string => {
  // Assuming YYYYMMDD format
  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  };

  return `${formatDate(startPeriod)} - ${formatDate(endPeriod)}`;
};

const VillaRatePlanCard: React.FC<{
  ratePlan: VillaRatePlan;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({ ratePlan, onDelete, isDeleting }) => {
  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Rate Plan',
      content: `Are you sure you want to delete the rate plan "${ratePlan.name}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => {
        onDelete(ratePlan.id);
      },
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-lg font-semibold">{ratePlan.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                {formatDateRange(ratePlan.startperiod, ratePlan.endperiod)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Condition */}
          <div className="flex items-center space-x-2 text-sm">
            <ConditionTypeIcon type={ratePlan.conditiontype} />
            <span className="text-gray-600">When</span>
            <span className="font-medium">{formatConditionType(ratePlan.conditiontype)}</span>
            <span className="text-gray-600">{formatConditionOperator(ratePlan.conditionoperator)}</span>
            <span className="font-semibold text-blue-600">{ratePlan.conditionvalue}</span>
          </div>
          
          {/* Application */}
          <div className="flex items-center space-x-2 text-sm">
            <ApplicationValueTypeIcon type={ratePlan.applicationvaluetype} />
            <span className="text-gray-600">Apply</span>
            <span className="font-semibold text-green-600">
              {ratePlan.applicationvalue}
              {ratePlan.applicationvaluetype === 'PERCENTAGE' ? '%' : ''}
            </span>
            <span className="text-gray-600">{formatApplicationType(ratePlan.applicationtype)}</span>
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-400 pt-2 border-t">
            Created: {new Date(ratePlan.timestamps.creationdate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VillaRatePlansManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const { 
    data: ratePlans, 
    isLoading, 
    error,
    refetch,
  } = useVillaRatePlans();

  const deleteRatePlanMutation = useDeleteVillaRatePlan();

  // Bulk selection handlers
  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!ratePlans) return;
    
    const allIds = ratePlans.map(plan => plan.id);
    setSelectedItems(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, [ratePlans]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isAllSelected = ratePlans ? selectedItems.length === ratePlans.length && ratePlans.length > 0 : false;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < (ratePlans?.length || 0);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;

    Modal.confirm({
      title: 'Delete Rate Plans',
      content: `Are you sure you want to delete ${selectedItems.length} rate plan${selectedItems.length > 1 ? 's' : ''}?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsBulkDeleting(true);
        try {
          await Promise.all(
            selectedItems.map(id => deleteRatePlanMutation.mutateAsync(id))
          );
          
          notification.success({
            message: 'Rate Plans Deleted',
            description: 'Selected rate plans have been deleted successfully.',
          });
          
          setSelectedItems([]);
          refetch();
        } catch (error) {
          notification.error({
            message: 'Delete Failed',
            description: error instanceof Error ? error.message : 'Failed to delete rate plans.',
          });
        } finally {
          setIsBulkDeleting(false);
        }
      },
    });
  }, [selectedItems, deleteRatePlanMutation, refetch]);

  const handleDelete = async (ratePlanId: string) => {
    try {
      await deleteRatePlanMutation.mutateAsync(ratePlanId);
      notification.success({
        message: 'Rate Plan Deleted',
        description: 'Rate plan has been deleted successfully.',
      });
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete rate plan.',
      });
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    notification.success({
      message: 'Rate Plan Created',
      description: 'New rate plan has been created successfully.',
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">Failed to load rate plans: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Villa Rate Plans</h1>
          <p className="text-gray-600 mt-1">
            Manage pricing adjustments based on guest count or stay duration
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Rate Plan
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedItems.length} rate plan{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="text-blue-700 hover:text-blue-800"
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting || selectedItems.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Plans Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`rate-plan-skeleton-${i}`} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && ratePlans && ratePlans.length > 0 && (
        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-3 p-2">
            <input
              id="select-all-rate-plans"
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="select-all-rate-plans" className="text-sm font-medium text-gray-700">
              Select all rate plans
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratePlans.map((ratePlan) => (
              <div key={ratePlan.id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(ratePlan.id)}
                  onChange={() => toggleSelectItem(ratePlan.id)}
                  className="absolute top-3 left-3 z-10 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="pl-8">
                  <VillaRatePlanCard
                    ratePlan={ratePlan}
                    onDelete={handleDelete}
                    isDeleting={deleteRatePlanMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && (!ratePlans || ratePlans.length === 0) && (
        <div className="text-center py-12">
          <Calculator className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No rate plans</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first rate plan.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Rate Plan
            </Button>
          </div>
        </div>
      )}

      {/* Create Rate Plan Modal */}
      <CreateVillaRatePlanModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default VillaRatePlansManagementPage;