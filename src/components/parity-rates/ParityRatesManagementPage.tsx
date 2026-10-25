'use client';

import React, { useState } from 'react';
import { useParityRates } from '@/hooks/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowLeftRight, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { CreateParityRateModal } from './CreateParityRateModal';
import { notification } from 'antd';
import styles from './ParityRatesManagementPage.module.css';

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
      <div className={styles.div}>
        <div className={styles.div2}>
          <div>
            <h1 className={styles.h1}>Parity Rates Management</h1>
            <p className={styles.p}>Manage currency exchange rates</p>
          </div>
          <div className={styles.div3}>
            <Loader2 className={styles.loader2} />
          </div>
        </div>
        
        <div className={styles.div4}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className={styles.card}>
              <CardContent className={styles.cardContent}>
                <div className={styles.div5}></div>
                <div className={styles.div6}></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.div}>
        <div className={styles.div2}>
          <div>
            <h1 className={styles.h1}>Parity Rates Management</h1>
            <p className={styles.p}>Manage currency exchange rates</p>
          </div>
        </div>
        
        <Card>
          <CardContent className={styles.cardContent2}>
            <div className={styles.div7}>Error loading parity rates</div>
            <p className={styles.p2}>Please try again later or contact support if the problem persists.</p>
            <Button onClick={() => refetch()} className={styles.button}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.div}>
      {/* Header */}
      <div className={styles.div2}>
        <div>
          <h1 className={styles.h1}>Parity Rates Management</h1>
          <p className={styles.p}>Manage currency exchange rates for multi-currency support</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className={styles.button2}
        >
          <Plus className={styles.plus} />
          <span>Add Parity Rate</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.div4}>
        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div2}>
              <div>
                <p className={styles.p3}>Total Currency Pairs</p>
                <p className={styles.p4}>{currencyPairs.length}</p>
              </div>
              <div className={styles.div8}>
                <ArrowLeftRight className={styles.arrowLeftRight} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div2}>
              <div>
                <p className={styles.p3}>Unique Currencies</p>
                <p className={styles.p4}>
                  {new Set(currencyPairs.flatMap(pair => [pair.fromCurrency, pair.toCurrency])).size}
                </p>
              </div>
              <div className={styles.div9}>
                <DollarSign className={styles.dollarSign} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={styles.cardContent}>
            <div className={styles.div2}>
              <div>
                <p className={styles.p3}>Exchange Rates</p>
                <p className={styles.p4}>Active</p>
              </div>
              <div className={styles.div10}>
                <TrendingUp className={styles.trendingUp} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parity Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle className={styles.button2}>
            <ArrowLeftRight className={styles.arrowLeftRight2} />
            <span>Currency Exchange Rates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currencyPairs.length > 0 ? (
            <div className={styles.div11}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tr}>
                    <th className={styles.th}>From Currency</th>
                    <th className={styles.th}>To Currency</th>
                    <th className={styles.th2}>Exchange Rate</th>
                    <th className={styles.th3}>Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {currencyPairs.map((pair, index) => (
                    <tr key={index} className={styles.tr2}>
                      <td className={styles.td}>
                        <div className={styles.button2}>
                          <div className={styles.div12}>
                            <span className={styles.span}>
                              {pair.fromCurrency.slice(0, 2)}
                            </span>
                          </div>
                          <span className={styles.span2}>{pair.fromCurrency}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.button2}>
                          <div className={styles.div13}>
                            <span className={styles.span3}>
                              {pair.toCurrency.slice(0, 2)}
                            </span>
                          </div>
                          <span className={styles.span2}>{pair.toCurrency}</span>
                        </div>
                      </td>
                      <td className={styles.td2}>
                        <span className={styles.span4}>
                          {formatRate(pair.rate)}
                        </span>
                      </td>
                      <td className={styles.td3}>
                        <div className={styles.div14}>
                          1 {pair.fromCurrency} = {formatRate(pair.rate)} {pair.toCurrency}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.div15}>
              <ArrowLeftRight className={styles.arrowLeftRight3} />
              <h3 className={styles.h3}>No parity rates found</h3>
              <p className={styles.p5}>Get started by adding your first currency exchange rate.</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className={styles.plus2} />
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