'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Space, 
  Tag, 
  Modal,
  Form,
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Avatar,
  Dropdown,
  Menu
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons';
import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';

const { Option } = Select;
const { TabPane } = Tabs;
const { Meta } = Card;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

export default function AntdDemoPage() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      message.success('Form submitted successfully!');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AuthGuard>
      <Sidebar>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ant Design Components Demo
            </h1>
            <p className="text-gray-600">
              Explore various Ant Design components integrated into your villa management system.
            </p>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Buttons & Forms" key="1">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Buttons" className="mb-4">
                    <Space wrap>
                      <Button type="primary">Primary</Button>
                      <Button>Default</Button>
                      <Button type="dashed">Dashed</Button>
                      <Button type="link">Link</Button>
                      <Button type="primary" danger>
                        Danger
                      </Button>
                      <Button type="primary" icon={<PlusOutlined />}>
                        Add New
                      </Button>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Form Components" className="mb-4">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Input 
                        placeholder="Enter text" 
                        prefix={<SearchOutlined />}
                      />
                      <Select 
                        defaultValue="option1" 
                        style={{ width: '100%' }}
                        placeholder="Select an option"
                      >
                        <Option value="option1">Option 1</Option>
                        <Option value="option2">Option 2</Option>
                        <Option value="option3">Option 3</Option>
                      </Select>
                      <DatePicker style={{ width: '100%' }} />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Statistics" key="2">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Bookings"
                      value={1128}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Revenue"
                      value={112893}
                      precision={2}
                      valueStyle={{ color: '#cf1322' }}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Occupancy Rate"
                      value={93.5}
                      precision={1}
                      valueStyle={{ color: '#1890ff' }}
                      suffix="%"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Badge count={5} offset={[10, 0]}>
                      <Statistic
                        title="Active Villas"
                        value={12}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Badge>
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24} md={12}>
                  <Card title="Progress">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <p>Booking Goal Progress</p>
                        <Progress percent={75} />
                      </div>
                      <div>
                        <p>Revenue Target</p>
                        <Progress percent={60} status="active" />
                      </div>
                      <div>
                        <p>Customer Satisfaction</p>
                        <Progress percent={100} />
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card 
                    title="Quick Actions"
                    extra={
                      <Dropdown overlay={userMenu} placement="bottomRight">
                        <Avatar 
                          size="small" 
                          icon={<UserOutlined />} 
                          style={{ cursor: 'pointer' }}
                        />
                      </Dropdown>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button type="primary" block onClick={showModal}>
                        Create New Booking
                      </Button>
                      <Button block>
                        <BellOutlined /> View Notifications
                      </Button>
                      <Button block>
                        Generate Report
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Data Table" key="3">
              <Card 
                title="Villa Management Table" 
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                    Add New
                  </Button>
                }
              >
                <Table columns={columns} dataSource={data} />
              </Card>
            </TabPane>
          </Tabs>

          <Modal
            title="Create New Entry"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              name="demo_form"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input the name!' }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="age"
                    label="Age"
                    rules={[{ required: true, message: 'Please input the age!' }]}
                  >
                    <Input type="number" placeholder="Enter age" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please input the address!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter address" />
              </Form.Item>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Select placeholder="Select a category">
                  <Option value="developer">Developer</Option>
                  <Option value="designer">Designer</Option>
                  <Option value="manager">Manager</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Sidebar>
    </AuthGuard>
  );
}