import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Button,
  Space,
  Select,
  Modal,
  Form,
  Input,
  DatePicker,
  Avatar,
  message,
  Progress,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { leaveApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveManagement = () => {
  const { user, isSuperAdmin, isHR } = useAuth();
  const { isDarkMode } = useTheme();

  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAll({
        page,
        limit: 10,
        status: statusFilter,
        leaveType: typeFilter,
      });
      if (res?.data) {
        setLeaves(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await leaveApi.getBalance();
      if (res?.data) {
        setBalance(res.data.balance || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
    if (user?.employeeProfile) {
      fetchBalance();
    }
  }, [page, statusFilter, typeFilter]);

  const handleApply = async (values) => {
    setActionLoading(true);
    try {
      const [start, end] = values.dates;
      await leaveApi.apply({
        leaveType: values.leaveType,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        reason: values.reason,
      });
      message.success('Leave application submitted!');
      setApplyModalOpen(false);
      form.resetFields();
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      message.error(err.message || 'Failed to apply for leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveApi.approve(id, { comments: 'Approved by HR Manager' });
      message.success('Leave approved successfully');
      fetchLeaves();
    } catch (err) {
      message.error(err.message || 'Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!selectedLeaveId) return;
    setActionLoading(true);
    try {
      await leaveApi.reject(selectedLeaveId, { rejectionReason: rejectReason });
      message.success('Leave application rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedLeaveId(null);
      fetchLeaves();
    } catch (err) {
      message.error(err.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveApi.cancel(id);
      message.success('Leave application cancelled');
      fetchLeaves();
      fetchBalance();
    } catch (err) {
      message.error(err.message || 'Failed to cancel leave');
    }
  };

  const getStatusBadge = (status) => {
    const cls =
      status === 'Approved'
        ? 'badge-active'
        : status === 'Pending'
        ? 'badge-pending'
        : status === 'Rejected'
        ? 'badge-rejected'
        : 'badge-inactive';
    return <span className={`status-pill ${cls}`}>{status}</span>;
  };

  const columns = [
    ...(isSuperAdmin || isHR
      ? [
          {
            title: 'Employee',
            key: 'employee',
            render: (_, record) => (
              <Space size={8}>
                <Avatar
                  src={record.employee?.profilePhoto}
                  icon={<UserOutlined />}
                  size="small"
                  style={{ backgroundColor: '#2563eb' }}
                />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{record.employee?.fullName}</span>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {record.employee?.employeeId}
                  </div>
                </div>
              </Space>
            ),
          },
        ]
      : []),
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => <span className="status-pill badge-approved">{type}</span>,
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <span style={{ fontSize: 13 }}>
          {new Date(record.startDate).toLocaleDateString()} — {new Date(record.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      render: (d) => <strong style={{ fontSize: 13 }}>{d} days</strong>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (r) => <span style={{ color: '#475569', fontSize: 13 }}>{r}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'Pending') {
          if (isSuperAdmin || isHR) {
            return (
              <Space size={6}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981', height: 28, fontSize: 12, borderRadius: 6 }}
                  onClick={() => handleApprove(record._id)}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  style={{ height: 28, fontSize: 12, borderRadius: 6 }}
                  onClick={() => {
                    setSelectedLeaveId(record._id);
                    setRejectModalOpen(true);
                  }}
                >
                  Reject
                </Button>
              </Space>
            );
          }
          return (
            <Popconfirm
              title="Cancel Request"
              description="Are you sure you want to cancel this pending request?"
              onConfirm={() => handleCancel(record._id)}
            >
              <Button size="small" danger icon={<StopOutlined />} style={{ height: 28, fontSize: 12, borderRadius: 6 }}>
                Cancel
              </Button>
            </Popconfirm>
          );
        }
        if (record.rejectionReason) {
          return <span style={{ fontSize: 11, color: '#ef4444' }}>Reason: {record.rejectionReason}</span>;
        }
        return <span style={{ fontSize: 11, color: '#94a3b8' }}>Processed</span>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Leave & Time-Off Management"
        subtitle="Submit time-off requests, manage remote work permissions, and review manager decisions"
        extra={[
          <Button
            key="apply"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setApplyModalOpen(true)}
          >
            Apply for Leave
          </Button>,
        ]}
      />

      {/* Quota Widgets (if employee) */}
      {user?.employeeProfile && (
        <Card className="glass-card">
          <Title level={5} style={{ margin: '0 0 14px 0', fontWeight: 700, fontSize: 14 }}>
            Annual Paid Leave Allowances
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 6 }}>Casual Leave</span>
                <Progress
                  type="circle"
                  percent={Math.round(((balance.casualLeave || 0) / 12) * 100)}
                  format={() => `${balance.casualLeave || 0}d`}
                  strokeColor="#2563eb"
                  width={64}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 6 }}>Sick Leave</span>
                <Progress
                  type="circle"
                  percent={Math.round(((balance.sickLeave || 0) / 10) * 100)}
                  format={() => `${balance.sickLeave || 0}d`}
                  strokeColor="#ef4444"
                  width={64}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 6 }}>Earned Leave</span>
                <Progress
                  type="circle"
                  percent={Math.round(((balance.earnedLeave || 0) / 15) * 100)}
                  format={() => `${balance.earnedLeave || 0}d`}
                  strokeColor="#10b981"
                  width={64}
                />
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 12, display: 'block', marginBottom: 6 }}>Work From Home</span>
                <Progress
                  type="circle"
                  percent={Math.round(((balance.workFromHome || 0) / 24) * 100)}
                  format={() => `${balance.workFromHome || 0}d`}
                  strokeColor="#6366f1"
                  width={64}
                />
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Filter Card */}
      <Card className="glass-card" bodyStyle={{ padding: 14 }}>
        <Space wrap size={12}>
          <Select
            placeholder="All Statuses"
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            allowClear
            style={{ width: 160 }}
          >
            <Option value="Pending">Pending Review</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Rejected">Rejected</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>

          <Select
            placeholder="All Leave Types"
            value={typeFilter || undefined}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            allowClear
            style={{ width: 180 }}
          >
            <Option value="Casual Leave">Casual Leave</Option>
            <Option value="Sick Leave">Sick Leave</Option>
            <Option value="Earned Leave">Earned Leave</Option>
            <Option value="Work From Home">Work From Home</Option>
          </Select>
        </Space>
      </Card>

      {/* Leave Requests Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={leaves}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
          locale={{ emptyText: 'No leave applications found' }}
        />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        title="Submit Leave Application"
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleApply} style={{ marginTop: 12 }}>
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select leave category' }]}
          >
            <Select placeholder="Select leave category">
              <Option value="Casual Leave">Casual Leave (Available: {balance.casualLeave || 0})</Option>
              <Option value="Sick Leave">Sick Leave (Available: {balance.sickLeave || 0})</Option>
              <Option value="Earned Leave">Earned Leave (Available: {balance.earnedLeave || 0})</Option>
              <Option value="Work From Home">Work From Home (Available: {balance.workFromHome || 0})</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dates"
            label="Duration (Start & End Date)"
            rules={[{ required: true, message: 'Please select dates' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Absence / WFH"
            rules={[{ required: true, message: 'Please specify reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Provide details about your leave..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setApplyModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Submit Application
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Leave Modal */}
      <Modal
        title="Reject Leave Request"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedLeaveId(null);
        }}
        onOk={handleReject}
        confirmLoading={actionLoading}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <p style={{ marginBottom: 8, fontSize: 13, color: '#64748b' }}>
          Please enter the reason for rejecting this leave application:
        </p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Critical project milestone scheduled on these dates."
        />
      </Modal>
    </div>
  );
};

export default LeaveManagement;
