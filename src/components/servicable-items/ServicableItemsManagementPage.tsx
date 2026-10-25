'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useServicableItems, useUpdateServicableItemStatus, useDeleteServicableItem } from '@/hooks/api';
import { ServicableItem, ServicableItemStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Package, DollarSign, Hash, CheckCircle, XCircle, ChevronDown, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { CreateServicableItemModal } from './CreateServicableItemModal';
import styles from './ServicableItemsManagementPage.module.css';

const ServicableItemStatusIcon: React.FC<{ status: ServicableItemStatus }> = ({ status }) => {
  if (status === 'ACTIVE') {
    return <CheckCircle className={styles.checkCircle} />;
  }
  return <XCircle className={styles.xCircle} />;
};

const ServicableItemStatusBadge: React.FC<{ status: ServicableItemStatus }> = ({ status }) => {
  const getStatusColor = (status: ServicableItemStatus) => {
    switch (status) {
      case 'ACTIVE':
        return styles.cls;
      case 'INACTIVE':
        return styles.cls2;
      default:
        return styles.cls2;
    }
  };

  return (
    <span className={`${styles.span} ${getStatusColor(status)}`}>
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
    <div className={styles.div} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={styles.button}
      >
        <ServicableItemStatusBadge status={servicableItem.status} />
        <ChevronDown className={styles.chevronDown} />
      </button>
      
      {isOpen && (
        <div className={styles.div2}>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`${styles.button2} ${
                status === servicableItem.status ? styles.button3 : ''
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
    <div className={styles.div3}>
      <div className={styles.div4}>
        <Card>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <AlertTriangle className={styles.alertTriangle} />
              Delete Serviceable Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.p}>
              Are you sure you want to delete &ldquo;{servicableItem.name}&rdquo;? This action cannot be undone.
            </p>
            <div className={styles.div5}>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isDeleting}
                className={styles.button4}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className={styles.button5}
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
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <div className={styles.div6}>
          <div className={styles.div7}>
            {servicableItem.iconlink ? (
              <div className={styles.div8}>
                <Image 
                  src={servicableItem.iconlink} 
                  alt={servicableItem.name}
                  fill
                  className={styles.image}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.nextElementSibling?.classList.remove(styles.hidden);
                  }}
                />
              </div>
            ) : null}
            <div className={`${styles.div9} ${servicableItem.iconlink ? styles.hidden : ''}`}>
              <Package className={styles.package} />
            </div>
            <div className={styles.button4}>
              <h3 className={styles.h3}>
                {servicableItem.name}
              </h3>
              <p className={styles.p2}>
                {servicableItem.description}
              </p>
              <div className={styles.div11}>
                <span className={styles.span2}>
                  <DollarSign className={styles.dollarSign} />
                  {servicableItem.price.amount} {servicableItem.price.currency}
                </span>
                <span className={styles.span2}>
                  <Hash className={styles.dollarSign} />
                  {servicableItem.unit}
                </span>
                <span>
                  Qty: {servicableItem.minimum}-{servicableItem.maximum}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.div12}>
            <StatusDropdown 
              servicableItem={servicableItem}
              onStatusChange={onStatusChange}
              isUpdating={isUpdating}
            />
            <button
              onClick={onDelete}
              className={styles.button6}
              title="Delete item"
            >
              <Trash2 className={styles.dollarSign} />
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
      <div className={styles.cardContent}>
        <div className={styles.div13}>
          <div className={styles.div14}></div>
          <div className={styles.div15}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.div16}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cardContent}>
        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div17}>
              <AlertTriangle className={styles.alertTriangle2} />
              <h3 className={styles.h32}>Error Loading Serviceable Items</h3>
              <p className={styles.p3}>
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
    <div className={styles.div18}>
      {/* Header */}
      <div className={styles.div19}>
        <div>
          <h1 className={styles.h1}>
            <Settings className={styles.settings} />
            Serviceable Items
          </h1>
          <p className={styles.p4}>
            Manage additional services and amenities for your villa
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.button7}
        >
          <Plus className={styles.plus} />
          Add New Item
        </Button>
      </div>

      {/* Stats Card */}
      {servicableItemsPage && (
        <Card className={styles.card2}>
          <CardContent className={styles.cardContent}>
            <div className={styles.div20}>
              <div className={styles.div17}>
                <div className={styles.div21}>{servicableItemsPage.totalElements}</div>
                <div className={styles.div22}>Total Items</div>
              </div>
              <div className={styles.div17}>
                <div className={styles.div23}>
                  {servicableItems.filter(item => item.status === 'ACTIVE').length}
                </div>
                <div className={styles.div22}>Active Items</div>
              </div>
              <div className={styles.div17}>
                <div className={styles.div24}>
                  {servicableItems.filter(item => item.status === 'INACTIVE').length}
                </div>
                <div className={styles.div22}>Inactive Items</div>
              </div>
              <div className={styles.div17}>
                <div className={styles.div25}>{totalPages}</div>
                <div className={styles.div22}>Total Pages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Serviceable Items List */}
      {servicableItems.length === 0 ? (
        <Card>
          <CardContent className={styles.cardContent2}>
            <div className={styles.div17}>
              <Package className={styles.package2} />
              <h3 className={styles.h32}>No Serviceable Items</h3>
              <p className={styles.p3}>
                You haven&rsquo;t created any serviceable items yet. Add your first item to get started.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.button7}
              >
                <Plus className={styles.plus} />
                Add Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.div26}>
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
        <div className={styles.div27}>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <div className={styles.span2}>
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
                  className={styles.button8}
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