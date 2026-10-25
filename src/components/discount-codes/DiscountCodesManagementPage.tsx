'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDiscountCodes, useUpdateDiscountCodeStatus } from '@/hooks/api';
import { DiscountCode, DiscountType, DiscountCodeStatus, DiscountCodeUsageType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, Percent, DollarSign, Clock, Users, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { CreateDiscountCodeModal } from './CreateDiscountCodeModal';
import { notification } from 'antd';
import styles from './DiscountCodesManagementPage.module.css';


const DiscountTypeIcon: React.FC<{ type: DiscountType }> = ({ type }) => {
  if (type === 'PERCENTAGE') {
    return <Percent className={styles.percent} />;
  }
  return <DollarSign className={styles.dollarSign} />;
};

const DiscountStatusBadge: React.FC<{ status: DiscountCodeStatus }> = ({ status }) => {
  const getStatusColor = (status: DiscountCodeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return styles.cls;
      case 'INACTIVE':
        return styles.cls2;
      case 'EXPIRED':
        return styles.cls3;
      default:
        return styles.cls2;
    }
  };

  const getStatusIcon = (status: DiscountCodeStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className={styles.checkCircle} />;
      case 'INACTIVE':
        return <XCircle className={styles.checkCircle} />;
      case 'EXPIRED':
        return <Clock className={styles.checkCircle} />;
      default:
        return <XCircle className={styles.checkCircle} />;
    }
  };

  return (
    <span className={`${styles.span} ${getStatusColor(status)}`}>
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
    <div className={styles.div} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={styles.button}
      >
        <DiscountStatusBadge status={discountCode.status} />
        <ChevronDown className={styles.checkCircle} />
      </button>
      
      {isOpen && (
        <div className={styles.div2}>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`${styles.button2} ${
                status === discountCode.status ? styles.button3 : ''
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
    <span className={`${styles.span} ${
      usageType === 'SINGLE_USE' 
        ? styles.span2 
        : styles.span3
    }`}>
      <Users className={styles.checkCircle} />
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
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <div className={styles.div3}>
          <div className={styles.div4}>
            <div className={styles.div5}>
              <code className={styles.code}>
                {discountCode.code}
              </code>
              <DiscountTypeIcon type={discountCode.discounttype} />
            </div>
            <div className={styles.div5}>
              <span className={styles.span4}>
                {formatValue(discountCode.value, discountCode.discounttype)}
              </span>
              <span className={styles.span5}>
                {discountCode.discounttype === 'PERCENTAGE' ? 'off' : 'discount'}
              </span>
            </div>
          </div>
          <div className={styles.div6}>
            <StatusDropdown 
              discountCode={discountCode}
              onStatusChange={(newStatus) => onStatusChange(discountCode.id, newStatus)}
              isUpdating={isUpdating}
            />
            <UsageTypeBadge usageType={discountCode.usagetype} />
          </div>
        </div>

        <div className={styles.div7}>
          <div>
            <span className={styles.span6}>Created:</span>
            <div>{formatDate(discountCode.timestamps.creationdate)}</div>
          </div>
          <div>
            <span className={styles.span6}>Expires:</span>
            <div>
              {discountCode.timestamps.expirationdate 
                ? formatDate(discountCode.timestamps.expirationdate)
                : 'Never'
              }
            </div>
          </div>
          <div>
            <span className={styles.span6}>Created by:</span>
            <div>
              {discountCode.createdby.personalinfo.firstname} {discountCode.createdby.personalinfo.lastname}
            </div>
          </div>
          <div>
            <span className={styles.span6}>Type:</span>
            <div className={styles.div8}>{discountCode.discounttype.toLowerCase().replace('_', ' ')}</div>
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
      notification.error({ message: `Failed to update discount code status: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.div9}>
        <div className={styles.div10}>
          <div className={styles.div11}></div>
          <p className={styles.p}>Loading discount codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.div9}>
        <div className={styles.div10}>
          <div className={styles.div12}>
            <XCircle className={styles.xCircle} />
            <p className={styles.p2}>Error loading discount codes</p>
          </div>
          <p className={styles.p3}>
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
    <div className={styles.div13}>
      {/* Header */}
      <div className={styles.div14}>
        <div>
          <h1 className={styles.h1}>Discount Codes</h1>
          <p className={styles.p4}>
            Manage discount codes for your villa bookings
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.button4}
        >
          <Plus className={styles.plus} />
          Create Discount Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.div15}>
        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div16}>
              <div className={styles.div4}>
                <p className={styles.p5}>Total Codes</p>
                <p className={styles.h1}>{discountCodes.length}</p>
              </div>
              <div className={styles.div17}>
                <Percent className={styles.percent2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div16}>
              <div className={styles.div4}>
                <p className={styles.p5}>Active Codes</p>
                <p className={styles.p6}>
                  {discountCodes.filter(code => code.status === 'ACTIVE').length}
                </p>
              </div>
              <div className={styles.div18}>
                <CheckCircle className={styles.checkCircle2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div16}>
              <div className={styles.div4}>
                <p className={styles.p5}>Percentage Codes</p>
                <p className={styles.p7}>
                  {discountCodes.filter(code => code.discounttype === 'PERCENTAGE').length}
                </p>
              </div>
              <div className={styles.div17}>
                <Percent className={styles.percent2} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div16}>
              <div className={styles.div4}>
                <p className={styles.p5}>Fixed Amount</p>
                <p className={styles.p6}>
                  {discountCodes.filter(code => code.discounttype === 'FIXED_AMOUNT').length}
                </p>
              </div>
              <div className={styles.div18}>
                <DollarSign className={styles.checkCircle2} />
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
        <CardContent className={styles.cardContent}>
          {discountCodes.length === 0 ? (
            <div className={styles.div19}>
              <Percent className={styles.percent3} />
              <h3 className={styles.h3}>No discount codes yet</h3>
              <p className={styles.p3}>
                Create your first discount code to start offering promotions to guests.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className={styles.plus2} />
                Create Discount Code
              </Button>
            </div>
          ) : (
            <div className={styles.div20}>
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