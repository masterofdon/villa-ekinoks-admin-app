'use client';

import React, { useState } from 'react';
import { useCreateServicableItem } from '@/hooks/api';
import { Create_ServiceableItem_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Package, DollarSign, Hash, AlignLeft, Link, Target, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './CreateServicableItemModal.module.css';

interface CreateServicableItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateServicableItemModal: React.FC<CreateServicableItemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<Omit<Create_ServiceableItem_WC_MLS_XAction, 'villaid'>>({
    name: '',
    description: '',
    iconlink: '',
    unit: '',
    price: {
      amount: '',
      currency: 'TRY',
    },
    minimum: 1,
    maximum: 10,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createServicableItemMutation = useCreateServicableItem();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.price.amount || parseFloat(formData.price.amount) <= 0) {
      newErrors.priceAmount = 'Price amount must be greater than 0';
    }

    if (formData.minimum < 0) {
      newErrors.minimum = 'Minimum cannot be negative';
    }

    if (formData.maximum < formData.minimum) {
      newErrors.maximum = 'Maximum must be greater than or equal to minimum';
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
      await createServicableItemMutation.mutateAsync(formData);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        iconlink: '',
        unit: '',
        price: {
          amount: '',
          currency: 'TRY',
        },
        minimum: 1,
        maximum: 10,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create serviceable item:', error);
      setErrors({ general: 'Failed to create serviceable item. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('price.')) {
      const priceField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [priceField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.div}>
      <div className={styles.div2}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>
              <Package className={styles.package} />
              Create New Serviceable Item
            </CardTitle>
            <button 
              onClick={onClose}
              className={styles.button}
            >
              <X className={styles.x} />
            </button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              {errors.general && (
                <div className={styles.div3}>
                  {errors.general}
                </div>
              )}

              {/* Name */}
              <div>
                <label className={styles.label}>
                  <Package className={styles.package2} />
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${
                    errors.name ? styles.input2 : styles.input3
                  }`}
                  placeholder="e.g., Airport Transfer, Breakfast Service"
                />
                {errors.name && <p className={styles.p}>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className={styles.label}>
                  <AlignLeft className={styles.package2} />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`${styles.input} ${
                    errors.description ? styles.input2 : styles.input3
                  }`}
                  placeholder="Detailed description of the service"
                />
                {errors.description && <p className={styles.p}>{errors.description}</p>}
              </div>

              {/* Icon Link */}
              <div>
                <label className={styles.label}>
                  <Link className={styles.package2} />
                  Icon URL
                </label>
                <input
                  type="url"
                  value={formData.iconlink}
                  onChange={(e) => handleInputChange('iconlink', e.target.value)}
                  className={styles.input4}
                  placeholder="https://example.com/icon.png"
                />
              </div>

              {/* Unit */}
              <div>
                <label className={styles.label}>
                  <Hash className={styles.package2} />
                  Unit *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`${styles.input} ${
                    errors.unit ? styles.input2 : styles.input3
                  }`}
                  placeholder="e.g., per person, per trip, per meal"
                />
                {errors.unit && <p className={styles.p}>{errors.unit}</p>}
              </div>

              {/* Price */}
              <div className={styles.div4}>
                <div>
                  <label className={styles.label}>
                    <DollarSign className={styles.package2} />
                    Price Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price.amount}
                    onChange={(e) => handleInputChange('price.amount', e.target.value)}
                    className={`${styles.input} ${
                      errors.priceAmount ? styles.input2 : styles.input3
                    }`}
                    placeholder="0.00"
                  />
                  {errors.priceAmount && <p className={styles.p}>{errors.priceAmount}</p>}
                </div>

                <div>
                  <label className={styles.label}>
                    Currency
                  </label>
                  <select
                    value={formData.price.currency}
                    onChange={(e) => handleInputChange('price.currency', e.target.value)}
                    className={styles.input4}
                  >
                    <option value="TRY">TRY (Turkish Lira)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>

              {/* Minimum and Maximum */}
              <div className={styles.div4}>
                <div>
                  <label className={styles.label}>
                    <TrendingDown className={styles.package2} />
                    Minimum Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimum}
                    onChange={(e) => handleInputChange('minimum', parseInt(e.target.value) || 0)}
                    className={`${styles.input} ${
                      errors.minimum ? styles.input2 : styles.input3
                    }`}
                  />
                  {errors.minimum && <p className={styles.p}>{errors.minimum}</p>}
                </div>

                <div>
                  <label className={styles.label}>
                    <TrendingUp className={styles.package2} />
                    Maximum Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maximum}
                    onChange={(e) => handleInputChange('maximum', parseInt(e.target.value) || 1)}
                    className={`${styles.input} ${
                      errors.maximum ? styles.input2 : styles.input3
                    }`}
                  />
                  {errors.maximum && <p className={styles.p}>{errors.maximum}</p>}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className={styles.div5}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={styles.button2}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createServicableItemMutation.isPending}
                  className={styles.button3}
                >
                  {createServicableItemMutation.isPending ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};