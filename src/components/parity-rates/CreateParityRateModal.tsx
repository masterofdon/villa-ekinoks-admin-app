'use client';

import React, { useState } from 'react';
import { useCreateParityRate } from '@/hooks/api';
import { Create_ParityRate_WC_MLS_XAction } from '@/types';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

interface CreateParityRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

// Common currencies list
const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'HUF', name: 'Hungarian Forint' },
];

export const CreateParityRateModal: React.FC<CreateParityRateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [form] = Form.useForm();
  const createParityRateMutation = useCreateParityRate();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const parityRateData: Create_ParityRate_WC_MLS_XAction = {
        fromcurrency: values.fromcurrency,
        tocurrency: values.tocurrency,
        rate: values.rate.toString(), // Convert number to string with proper formatting
      };

      await createParityRateMutation.mutateAsync(parityRateData);
      form.resetFields();
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add New Parity Rate"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={createParityRateMutation.isPending}
      okText="Create Parity Rate"
      cancelText="Cancel"
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4"
        initialValues={{
          rate: 1.0000
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="From Currency"
            name="fromcurrency"
            rules={[
              { required: true, message: 'Please select the source currency' },
            ]}
          >
            <Select
              placeholder="Select source currency"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) ||
                String(option?.value)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {COMMON_CURRENCIES.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="To Currency"
            name="tocurrency"
            rules={[
              { required: true, message: 'Please select the target currency' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const fromCurrency = getFieldValue('fromcurrency');
                  if (!value || fromCurrency !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Target currency must be different from source currency'));
                },
              }),
            ]}
          >
            <Select
              placeholder="Select target currency"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) ||
                String(option?.value)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {COMMON_CURRENCIES.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label="Exchange Rate"
          name="rate"
          rules={[
            { required: true, message: 'Please enter the exchange rate' },
            { type: 'number', min: 0.0001, message: 'Rate must be greater than 0.0001' },
            { type: 'number', max: 999999.9999, message: 'Rate must be less than 999999.9999' },
          ]}
          tooltip="Exchange rate format: d.dddd (up to 4 decimal places)"
        >
          <InputNumber
            placeholder="Enter exchange rate (e.g., 1.2345)"
            min={0.0001}
            max={999999.9999}
            step={0.0001}
            precision={4}
            className="w-full"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value: string | undefined) => {
              const parsed = parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0');
              return parsed as any;
            }}
          />
        </Form.Item>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Exchange Rate Information</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Exchange rate represents how much of the target currency equals 1 unit of the source currency</p>
            <p>• Example: If USD to EUR rate is 0.8500, then 1 USD = 0.8500 EUR</p>
            <p>• Rates support up to 4 decimal places for precision</p>
          </div>
        </div>
      </Form>
    </Modal>
  );
};