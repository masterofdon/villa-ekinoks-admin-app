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
import { Button } from '@/components/ui/Button';
import { Plus, Calculator, Trash2, Calendar, Users, Clock, DollarSign, Percent } from 'lucide-react';
import { CreateVillaRatePlanModal } from './CreateVillaRatePlanModal';
import { notification, App } from 'antd';
import styles from './VillaRatePlansManagementPage.module.css';

const ConditionTypeIcon: React.FC<{ type: VillaRatePlanConditionType }> = ({ type }) => {
  if (type === 'NUMBEROFGUESTS') {
    return <Users className={styles.users} />;
  }
  return <Clock className={styles.clock} />;
};

const ApplicationValueTypeIcon: React.FC<{ type: VillaRatePlanApplicationValueType }> = ({ type }) => {
  if (type === 'PERCENTAGE') {
    return <Percent className={styles.percent} />;
  }
  return <DollarSign className={styles.clock} />;
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

const VillaRatePlanListItem: React.FC<{
  ratePlan: VillaRatePlan;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}> = ({ ratePlan, onDelete, isDeleting, isSelected, onToggleSelect }) => {
  const { modal } = App.useApp();
  
  const handleDelete = () => {
    modal.confirm({
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
    <div className={`${styles.div} ${
      isSelected ? styles.div2 : styles.div3
    }`}>
      <div className={styles.div4}>
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(ratePlan.id)}
          className={styles.input}
        />
        
        {/* Rate Plan Icon and Name */}
        <div className={styles.div5}>
          <Calculator className={styles.calculator} />
          <div className={styles.div6}>
            <h3 className={styles.h3}>{ratePlan.name}</h3>
            <div className={styles.div7}>
              <Calendar className={styles.calendar} />
              {formatDateRange(ratePlan.startperiod, ratePlan.endperiod)}
            </div>
          </div>
        </div>

        {/* Condition Details */}
        <div className={styles.div8}>
          <div className={styles.div9}>
            <ConditionTypeIcon type={ratePlan.conditiontype} />
            <div className={styles.div10}>
              <span className={styles.span}>{formatConditionType(ratePlan.conditiontype)}</span>
              <span className={styles.span2}>{formatConditionOperator(ratePlan.conditionoperator)} {ratePlan.conditionvalue}</span>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className={styles.div11}>
          <div className={styles.div9}>
            <ApplicationValueTypeIcon type={ratePlan.applicationvaluetype} />
            <div className={styles.div10}>
              <span className={styles.span3}>
                {ratePlan.applicationvalue}
                {ratePlan.applicationvaluetype === 'PERCENTAGE' ? '%' : ''}
              </span>
              <span className={styles.span2}>{formatApplicationType(ratePlan.applicationtype)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.div9}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className={styles.button}
          >
            <Trash2 className={styles.trash2} />
          </Button>
        </div>
      </div>

      {/* Mobile Details - shown on smaller screens */}
      <div className={styles.div12}>
        <div className={styles.div13}>
          <ConditionTypeIcon type={ratePlan.conditiontype} />
          <span className={styles.span4}>When {formatConditionType(ratePlan.conditiontype)} {formatConditionOperator(ratePlan.conditionoperator)}</span>
          <span className={styles.span5}>{ratePlan.conditionvalue}</span>
        </div>
        <div className={styles.div13}>
          <ApplicationValueTypeIcon type={ratePlan.applicationvaluetype} />
          <span className={styles.span4}>Apply</span>
          <span className={styles.span6}>
            {ratePlan.applicationvalue}
            {ratePlan.applicationvaluetype === 'PERCENTAGE' ? '%' : ''}
          </span>
          <span className={styles.span4}>{formatApplicationType(ratePlan.applicationtype)}</span>
        </div>

      </div>
    </div>
  );
};

const VillaRatePlansManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const { modal } = App.useApp();
  
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

    modal.confirm({
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
  }, [selectedItems, deleteRatePlanMutation, refetch, modal]);

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
      <div className={styles.div14}>
        <p className={styles.p}>Failed to load rate plans: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className={styles.div15}>
      {/* Header */}
      <div className={styles.div16}>
        <div>
          <h1 className={styles.h1}>Villa Rate Plans</h1>
          <p className={styles.p2}>
            Manage pricing adjustments based on guest count or stay duration
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.button2}
        >
          <Plus className={styles.plus} />
          Create Rate Plan
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div className={styles.div17}>
          <div className={styles.div16}>
            <span className={styles.span7}>
              {selectedItems.length} rate plan{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className={styles.div9}>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className={styles.button3}
              >
                Clear Selection
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting || selectedItems.length === 0}
              >
                <Trash2 className={styles.trash22} />
                {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Plans List */}
      {isLoading && (
        <div className={styles.div18}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`rate-plan-skeleton-${i}`} className={styles.div19}></div>
          ))}
        </div>
      )}
      
      {!isLoading && ratePlans && ratePlans.length > 0 && (
        <div className={styles.div20}>
          {/* List Header */}
          <div className={styles.div21}>
            <div className={styles.div4}>
              <input
                id="select-all-rate-plans"
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={toggleSelectAll}
                className={styles.input}
              />
              <div className={styles.div22}>
                <label htmlFor="select-all-rate-plans" className={styles.label}>
                  Rate Plans ({ratePlans.length})
                </label>
                <p className={styles.p3}>
                  {selectedItems.length === 0 
                    ? 'Select rate plans to perform bulk actions'
                    : `${selectedItems.length} of ${ratePlans.length} selected`
                  }
                </p>
              </div>
              <div className={styles.div23}>
                Condition
              </div>
              <div className={styles.div24}>
                Application
              </div>
              <div className={styles.div25}>
                Actions
              </div>
            </div>
          </div>

          {/* Rate Plans List */}
          <div className={styles.div26}>
            {ratePlans
              .sort((a, b) => new Date(b.timestamps.creationdate).getTime() - new Date(a.timestamps.creationdate).getTime())
              .map((ratePlan) => (
              <VillaRatePlanListItem
                key={ratePlan.id}
                ratePlan={ratePlan}
                onDelete={handleDelete}
                isDeleting={deleteRatePlanMutation.isPending}
                isSelected={selectedItems.includes(ratePlan.id)}
                onToggleSelect={toggleSelectItem}
              />
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && (!ratePlans || ratePlans.length === 0) && (
        <div className={styles.div27}>
          <Calculator className={styles.calculator2} />
          <h3 className={styles.h32}>No rate plans</h3>
          <p className={styles.p4}>
            Get started by creating your first rate plan.
          </p>
          <div className={styles.div28}>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.button2}
            >
              <Plus className={styles.plus} />
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