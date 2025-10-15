'use client';

import React, { useState } from 'react';
import { useCreateDiscountCode } from '@/hooks/api';
import { DiscountType, DiscountCodeUsageType, Create_DiscountCode_WC_MLS_XAction } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { X, Percent, DollarSign, Calendar, Users, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Create Discount Code</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Discount Type */}
              <div className="space-y-2">
                <Label htmlFor="discounttype" className="text-sm font-medium">
                  Discount Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'PERCENTAGE')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      formData.type === 'PERCENTAGE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    <span className="text-sm font-medium">Percentage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'FIXED_AMOUNT')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      formData.type === 'FIXED_AMOUNT'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Fixed Amount</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium">
                  Discount Value
                  {formData.type === 'PERCENTAGE' && (
                    <span className="text-gray-500 ml-1">(0-100)</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="value"
                    type="number"
                    step={formData.type === 'PERCENTAGE' ? '0.01' : '0.01'}
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder={formData.type === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 50.00'}
                    className={errors.value ? 'border-red-500' : ''}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {formData.type === 'PERCENTAGE' ? '%' : '$'}
                    </span>
                  </div>
                </div>
                {errors.value && (
                  <p className="text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              {/* Usage Type */}
              <div className="space-y-2">
                <Label htmlFor="usagetype" className="text-sm font-medium">
                  Usage Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('usagetype', 'SINGLE_USE')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      formData.usagetype === 'SINGLE_USE'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Single Use</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('usagetype', 'MULTI_USE')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-colors ${
                      formData.usagetype === 'MULTI_USE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Multi Use</span>
                  </button>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <Label htmlFor="expirationdate" className="text-sm font-medium">
                  Expiration Date
                  <span className="text-gray-500 ml-1 font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="expirationdate"
                    type="date"
                    min={getMinDate()}
                    value={formData.expirationdate}
                    onChange={(e) => handleChange('expirationdate', e.target.value)}
                    className={errors.expirationdate ? 'border-red-500' : ''}
                    placeholder="Leave empty for no expiration"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.expirationdate && (
                  <p className="text-sm text-red-600">{errors.expirationdate}</p>
                )}
                <p className="text-xs text-gray-500">
                  Leave empty to create a discount code with no expiration date
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createDiscountCodeMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDiscountCodeMutation.isPending}
                  className="flex-1"
                >
                  {createDiscountCodeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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