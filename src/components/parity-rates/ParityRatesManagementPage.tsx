'use client';

import React, { useState } from 'react';
import { useParityRates } from '@/hooks/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowLeftRight, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { CreateParityRateModal } from './CreateParityRateModal';
import { notification } from 'antd';

const ParityRatesManagementPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: parityRatesResponse, isLoading, error, refetch } = useParityRates();

  const parityRates = parityRatesResponse?.rates || {};

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    notification.success({
      message: 'Success',
      description: 'Parity rate created successfully!',
      placement: 'topRight',
    });
    refetch();
  };

  const handleCreateError = (error: any) => {
    console.error('Create parity rate error:', error);
    notification.error({
      message: 'Error',
      description: error?.response?.data?.message || 'Failed to create parity rate. Please try again.',
      placement: 'topRight',
    });
  };

  // Format rate to show 4 decimal places
  const formatRate = (rate: string) => {
    const numRate = parseFloat(rate);
    return numRate.toFixed(4);
  };

  // Extract unique currencies from the rates object
  const getCurrencyPairs = () => {
    const pairs: Array<{
      fromCurrency: string;
      toCurrency: string;
      rate: string;
    }> = [];

    Object.entries(parityRates).forEach(([currencyPair, rate]) => {
      // Assuming the key format is "FROMCURRENCY_TOCURRENCY"
      const [fromCurrency, toCurrency] = currencyPair.split('_');
      if (fromCurrency && toCurrency) {
        pairs.push({
          fromCurrency,
          toCurrency,
          rate,
        });
      }
    });

    return pairs;
  };

  const currencyPairs = getCurrencyPairs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parity Rates Management</h1>
            <p className="text-gray-600">Manage currency exchange rates</p>
          </div>
          <div className="flex items-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parity Rates Management</h1>
            <p className="text-gray-600">Manage currency exchange rates</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-lg font-medium">Error loading parity rates</div>
            <p className="text-gray-600 mt-2">Please try again later or contact support if the problem persists.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parity Rates Management</h1>
          <p className="text-gray-600">Manage currency exchange rates for multi-currency support</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Parity Rate</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Currency Pairs</p>
                <p className="text-2xl font-bold text-gray-900">{currencyPairs.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ArrowLeftRight className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Currencies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(currencyPairs.flatMap(pair => [pair.fromCurrency, pair.toCurrency])).size}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exchange Rates</p>
                <p className="text-2xl font-bold text-gray-900">Active</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parity Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5" />
            <span>Currency Exchange Rates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currencyPairs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">From Currency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">To Currency</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Exchange Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {currencyPairs.map((pair, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {pair.fromCurrency.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{pair.fromCurrency}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-green-600">
                              {pair.toCurrency.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{pair.toCurrency}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatRate(pair.rate)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm text-gray-600">
                          1 {pair.fromCurrency} = {formatRate(pair.rate)} {pair.toCurrency}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parity rates found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first currency exchange rate.</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Parity Rate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Parity Rate Modal */}
      <CreateParityRateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
    </div>
  );
};

export default ParityRatesManagementPage;