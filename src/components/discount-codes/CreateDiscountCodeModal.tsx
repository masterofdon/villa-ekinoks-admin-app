'use client';

import React, { useState } from 'react';
import { useCreateDiscountCode } from '@/hooks/api';
import { DiscountType, DiscountCodeUsageType, Create_DiscountCode_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Percent, DollarSign, Calendar, Users, Clock } from 'lucide-react';
import styles from './CreateDiscountCodeModal.module.css';

interface CreateDiscountCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDiscountCodeModal: React.FC<CreateDiscountCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    type: 'PERCENTAGE' as DiscountType,
    value: '',
    usagetype: 'SINGLE_USE' as DiscountCodeUsageType,
    expirationdate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createDiscountCodeMutation = useCreateDiscountCode();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.value) {
      newErrors.value = 'Discount value is required';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.value = 'Discount value must be a positive number';
      } else if (formData.type === 'PERCENTAGE' && numValue > 100) {
        newErrors.value = 'Percentage discount cannot exceed 100%';
      }
    }

    // Expiration date is optional, but if provided, must be in the future
    if (formData.expirationdate) {
      const selectedDate = new Date(formData.expirationdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.expirationdate = 'Expiration date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const expirationTimestamp = formData.expirationdate 
        ? new Date(formData.expirationdate).getTime() 
        : null;
      
      const discountCodeData: Omit<Create_DiscountCode_WC_MLS_XAction, 'villaid'> = {
        type: formData.type,
        value: formData.value,
        usagetype: formData.usagetype,
        expirationdate: expirationTimestamp,
      };

      await createDiscountCodeMutation.mutateAsync(discountCodeData);
      
      // Reset form
      setFormData({
        type: 'PERCENTAGE',
        value: '',
        usagetype: 'SINGLE_USE',
        expirationdate: '',
      });
      setErrors({});
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create discount code:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create discount code',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className={styles.div}>
      <div className={styles.div2}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Create Discount Code</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className={styles.button}
            >
              <X className={styles.x} />
            </Button>
          </CardHeader>
          
          <CardContent className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Discount Type */}
              <div className={styles.div3}>
                <Label htmlFor="discounttype" className={styles.label}>
                  Discount Type
                </Label>
                <div className={styles.div4}>
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'PERCENTAGE')}
                    className={`${styles.button2} ${
                      formData.type === 'PERCENTAGE'
                        ? styles.button3
                        : styles.button4
                    }`}
                  >
                    <Percent className={styles.x} />
                    <span className={styles.label}>Percentage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'FIXED_AMOUNT')}
                    className={`${styles.button2} ${
                      formData.type === 'FIXED_AMOUNT'
                        ? styles.button5
                        : styles.button4
                    }`}
                  >
                    <DollarSign className={styles.x} />
                    <span className={styles.label}>Fixed Amount</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div className={styles.div3}>
                <Label htmlFor="value" className={styles.label}>
                  Discount Value
                  {formData.type === 'PERCENTAGE' && (
                    <span className={styles.span}>(0-100)</span>
                  )}
                </Label>
                <div className={styles.div5}>
                  <Input
                    id="value"
                    type="number"
                    step={formData.type === 'PERCENTAGE' ? '0.01' : '0.01'}
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 50.00'}
                    className={errors.value ? styles.input : ''}
                  />
                  <div className={styles.div6}>
                    <span className={styles.span2}>
                      {formData.type === 'PERCENTAGE' ? '%' : '$'}
                    </span>
                  </div>
                </div>
                {errors.value && (
                  <p className={styles.p}>{errors.value}</p>
                )}
              </div>

              {/* Usage Type */}
              <div className={styles.div3}>
                <Label htmlFor="usagetype" className={styles.label}>
                  Usage Type
                </Label>
                <div className={styles.div4}>
                  <button
                    type="button"
                    onClick={() => handleChange('usagetype', 'SINGLE_USE')}
                    className={`${styles.button2} ${
                      formData.usagetype === 'SINGLE_USE'
                        ? styles.button6
                        : styles.button4
                    }`}
                  >
                    <Users className={styles.x} />
                    <span className={styles.label}>Single Use</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('usagetype', 'MULTI_USE')}
                    className={`${styles.button2} ${
                      formData.usagetype === 'MULTI_USE'
                        ? styles.button3
                        : styles.button4
                    }`}
                  >
                    <Users className={styles.x} />
                    <span className={styles.label}>Multi Use</span>
                  </button>
                </div>
              </div>

              {/* Expiration Date */}
              <div className={styles.div3}>
                <Label htmlFor="expirationdate" className={styles.label}>
                  Expiration Date
                  <span className={styles.span3}>(optional)</span>
                </Label>
                <div className={styles.div5}>
                  <Input
                    id="expirationdate"
                    type="date"
                    min={getMinDate()}
                    value={formData.expirationdate}
                    onChange={(e) => handleChange('expirationdate', e.target.value)}
                    className={errors.expirationdate ? styles.input : ''}
                    placeholder="Leave empty for no expiration"
                  />
                  <Calendar className={styles.calendar} />
                </div>
                {errors.expirationdate && (
                  <p className={styles.p}>{errors.expirationdate}</p>
                )}
                <p className={styles.p2}>
                  Leave empty to create a discount code with no expiration date
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className={styles.div7}>
                  <p className={styles.p}>{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className={styles.div8}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createDiscountCodeMutation.isPending}
                  className={styles.button7}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDiscountCodeMutation.isPending}
                  className={styles.button7}
                >
                  {createDiscountCodeMutation.isPending ? (
                    <div className={styles.div9}>
                      <div className={styles.div10}></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Code'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};