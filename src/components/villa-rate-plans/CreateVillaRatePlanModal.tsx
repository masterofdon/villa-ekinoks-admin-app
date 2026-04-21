'use client';

import React from 'react';
import { useCreateVillaRatePlan } from '@/hooks/api';
import { 
  Create_VillaRatePlan_WC_MLS_XAction 
} from '@/types';
import { Modal, Form, Input, Select, DatePicker, Row, Col, InputNumber } from 'antd';
import dayjs from 'dayjs';

interface CreateVillaRatePlanModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

export const CreateVillaRatePlanModal: React.FC<CreateVillaRatePlanModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const createRatePlanMutation = useCreateVillaRatePlan();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format date range to YYYYMMDD format
      const startPeriod = values.dateRange[0].format('YYYYMMDD');
      const endPeriod = values.dateRange[1].format('YYYYMMDD');

      const ratePlanData: Create_VillaRatePlan_WC_MLS_XAction = {
        name: values.name,
        startperiod: startPeriod,
        endperiod: endPeriod,
        conditiontype: values.conditiontype,
        conditionoperator: values.conditionoperator,
        conditionvalue: values.conditionvalue.toString(),
        applicationtype: values.applicationtype,
        applicationvalue: values.applicationvalue.toString(),
        applicationvaluetype: values.applicationvaluetype,
      };

      await createRatePlanMutation.mutateAsync(ratePlanData);
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to create rate plan:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create Villa Rate Plan"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={createRatePlanMutation.isPending}
      okText="Create Rate Plan"
      cancelText="Cancel"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Rate Plan Name"
          rules={[
            { required: true, message: 'Please enter a rate plan name' },
            { min: 2, message: 'Name must be at least 2 characters' },
          ]}
        >
          <Input 
            placeholder="e.g., Weekend Premium, Group Discount, Extended Stay"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Validity Period"
          rules={[
            { required: true, message: 'Please select the validity period' },
          ]}
        >
          <RangePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder={['Start Date', 'End Date']}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="conditiontype"
              label="Condition Type"
              rules={[{ required: true, message: 'Please select condition type' }]}
            >
              <Select placeholder="Select condition type">
                <Option value="NUMBEROFGUESTS">Number of Guests</Option>
                <Option value="NUMBEROFNIGHTS">Number of Nights</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="conditionoperator"
              label="Condition Operator"
              rules={[{ required: true, message: 'Please select condition operator' }]}
            >
              <Select placeholder="Select operator">
                <Option value="EQUALS">Equals</Option>
                <Option value="GREATER_THAN">Greater Than</Option>
                <Option value="LESS_THAN">Less Than</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="conditionvalue"
          label="Condition Value"
          rules={[
            { required: true, message: 'Please enter condition value' },
            { type: 'number', min: 1, message: 'Value must be at least 1' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter value (e.g., 4 for 4 guests)"
            min={1}
            max={100}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="applicationvaluetype"
              label="Adjustment Type"
              rules={[{ required: true, message: 'Please select adjustment type' }]}
            >
              <Select placeholder="Select adjustment type">
                <Option value="PERCENTAGE">Percentage (%)</Option>
                <Option value="AMOUNT">Fixed Amount</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="applicationvalue"
              label="Adjustment Value"
              rules={[
                { required: true, message: 'Please enter adjustment value' },
                { type: 'number', min: 0.01, message: 'Value must be greater than 0' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter value"
                min={0.01}
                precision={2}
                step={0.01}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="applicationtype"
          label="Application Method"
          rules={[{ required: true, message: 'Please select application method' }]}
        >
          <Select placeholder="Select how the adjustment is applied">
            <Option value="PERGUEST">Per Guest</Option>
            <Option value="PERDAY">Per Day</Option>
            <Option value="PERGUESTPERDAY">Per Guest Per Day</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};