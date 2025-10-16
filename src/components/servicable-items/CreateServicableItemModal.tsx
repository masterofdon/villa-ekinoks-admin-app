'use client';

import React, { useState } from 'react';
import { useCreateServicableItem } from '@/hooks/api';
import { Create_ServiceableItem_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Package, DollarSign, Hash, AlignLeft, Link, Target, TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Create New Serviceable Item
            </CardTitle>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-2" />
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Airport Transfer, Breakfast Service"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlignLeft className="h-4 w-4 inline mr-2" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Detailed description of the service"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Icon Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="h-4 w-4 inline mr-2" />
                  Icon URL
                </label>
                <input
                  type="url"
                  value={formData.iconlink}
                  onChange={(e) => handleInputChange('iconlink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/icon.png"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-2" />
                  Unit *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., per person, per trip, per meal"
                />
                {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Price Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price.amount}
                    onChange={(e) => handleInputChange('price.amount', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.priceAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.priceAmount && <p className="text-red-500 text-sm mt-1">{errors.priceAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.price.currency}
                    onChange={(e) => handleInputChange('price.currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TRY">TRY (Turkish Lira)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </div>

              {/* Minimum and Maximum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingDown className="h-4 w-4 inline mr-2" />
                    Minimum Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimum}
                    onChange={(e) => handleInputChange('minimum', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.minimum ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minimum && <p className="text-red-500 text-sm mt-1">{errors.minimum}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <TrendingUp className="h-4 w-4 inline mr-2" />
                    Maximum Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maximum}
                    onChange={(e) => handleInputChange('maximum', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maximum ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maximum && <p className="text-red-500 text-sm mt-1">{errors.maximum}</p>}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createServicableItemMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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