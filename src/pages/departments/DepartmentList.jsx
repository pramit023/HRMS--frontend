import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Space,
  Avatar,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
  message,
  Spin,
} from 'antd';
import {
  ApartmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { departmentApi, employeeApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { isSuperAdmin, isHR } = useAuth();

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res?.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ limit: 100 });
      if (res?.data) {
        setEmployees(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);
    if (dept) {
      form.setFieldsValue({
        name: dept.name,
        code: dept.code,
        description: dept.description,
        head: dept.head?._id || dept.head,
        budget: dept.budget,
        location: dept.location,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ location: 'Headquarters', budget: 100000 });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingDept) {
        await departmentApi.update(editingDept._id, values);
        message.success('Department updated successfully');
      } else {
        await departmentApi.create(values);
        message.success('Department created successfully');
      }

      setModalOpen(false);
      form.resetFields();
      fetchDepartments();
    } catch (err) {
      message.error(err.message || 'Department operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await departmentApi.delete(id);
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      message.error(err.message || 'Cannot delete department');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading department roster..." />
      </div>
    );
  }

  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0);

  const columns = [
    {
      title: 'Department Name',
      key: 'name',
      render: (_, record) => (
        <Space size={12}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {record.code}
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{record.name}</span>
            <div style={{ fontSize: 11, color: '#64748b' }}>{record.description}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Department Head',
      dataIndex: 'head',
      key: 'head',
      render: (head) => (
        head ? (
          <Space size={8}>
            <Avatar src={head.profilePhoto} icon={<UserOutlined />} size="small" style={{ backgroundColor: '#2563eb' }} />
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{head.fullName}</span>
              <span style={{ fontSize: 10, color: '#64748b' }}>{head.designation}</span>
            </div>
          </Space>
        ) : (
          <span className="status-pill badge-inactive">Unassigned</span>
        )
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
          <span style={{ fontSize: 12 }}>{loc || 'HQ'}</span>
        </Space>
      ),
    },
    {
      title: 'Annual Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (b) => <span style={{ fontWeight: 600, color: '#2563eb' }}>${(b || 0).toLocaleString()}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <span className={`status-pill ${active ? 'badge-active' : 'badge-inactive'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          {(isSuperAdmin || isHR) && (
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#2563eb' }} />}
              onClick={() => handleOpenModal(record)}
            />
          )}
          {isSuperAdmin && (
            <Popconfirm
              title="Delete Department"
              description={`Delete ${record.name}? Reassign all employees first.`}
              onConfirm={() => handleDelete(record._id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Department Hierarchy & Budgets"
        subtitle="Corporate business units, budget allocation, physical locations, and leadership assignments"
        extra={[
          (isSuperAdmin || isHR) && (
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Create Department
            </Button>
          ),
        ]}
      />

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Total Departments"
            value={departments.length}
            icon={<ApartmentOutlined />}
            color="#2563eb"
            subtitle="Business divisions"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Total Corporate Budget"
            value={`$${totalBudget.toLocaleString()}`}
            icon={<DollarOutlined />}
            color="#10b981"
            subtitle="Annual operational budget"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Assigned Department Heads"
            value={departments.filter((d) => d.head).length}
            icon={<TeamOutlined />}
            color="#6366f1"
            subtitle={`${departments.filter((d) => !d.head).length} vacant positions`}
          />
        </Col>
      </Row>

      {/* Departments Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 750 }}
          locale={{ emptyText: 'No departments configured yet' }}
        />
      </Card>

      {/* Create / Edit Department Modal */}
      <Modal
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editingDept ? 'Update Department' : 'Create Department'}
        width="min(560px, calc(100vw - 24px))"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="e.g. Engineering & Technology" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="code"
                label="Department Code"
                rules={[{ required: true, message: 'Please enter department code' }]}
              >
                <Input placeholder="e.g. ENG" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="location" label="Physical Location">
                <Input placeholder="e.g. Tower A - Floor 4" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="budget"
            label="Annual Operational Budget ($)"
            rules={[{ required: true, message: 'Budget is required' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Form.Item>

          <Form.Item name="head" label="Department Head (Director / VP)">
            <Select placeholder="Select an employee as head" allowClear>
              {employees.map((emp) => (
                <Option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.designation})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Department Mission & Scope">
            <Input.TextArea rows={3} placeholder="Describe the mission and scope of this team..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentList;
