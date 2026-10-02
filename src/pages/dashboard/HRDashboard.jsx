import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Avatar,
  Space,
  Button,
  Spin,
  Modal,
  Input,
  message,
  List,
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { dashboardApi, leaveApi } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const fetchHRData = async () => {
    try {
      const res = await dashboardApi.getHR();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('HR Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, []);

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveApi.approve(leaveId, { comments: 'Approved via HR Dashboard' });
      message.success('Leave request approved');
      fetchHRData();
    } catch (err) {
      message.error(err.message || 'Failed to approve leave');
    }
  };

  const handleRejectLeave = async () => {
    if (!selectedLeaveId) return;
    setActionLoading(true);
    try {
      await leaveApi.reject(selectedLeaveId, { rejectionReason: rejectReason });
      message.success('Leave request rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedLeaveId(null);
      fetchHRData();
    } catch (err) {
      message.error(err.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading people operations..." />
      </div>
    );
  }

  const empOverview = data?.employeeOverview || {};
  const attSummary = data?.attendanceSummary || {};
  const pendingLeaves = data?.pendingLeaves || [];
  const birthdays = data?.upcomingBirthdays || [];
  const newJoiners = data?.newJoiners || [];

  const leaveColumns = [
    {
      title: 'Employee',
      dataIndex: 'employee',
      key: 'employee',
      render: (emp) => (
        <Space size={10}>
          <Avatar
            src={emp?.profilePhoto}
            icon={<UserOutlined />}
            size={36}
            style={{ backgroundColor: '#2563eb' }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 13 }}>{emp?.fullName}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{emp?.designation}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type) => <span className="status-pill badge-approved">{type}</span>,
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{record.days} day(s)</span>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {new Date(record.startDate).toLocaleDateString()} — {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text) => <span style={{ color: '#475569', fontSize: 13 }}>{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', height: 28, fontSize: 12, borderRadius: 6 }}
            onClick={() => handleApproveLeave(record._id)}
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
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="People Operations Hub"
        subtitle="Manage employee leave requests, attendance roll call, team milestones, and onboarding"
        extra={[
          <Button
            key="add-emp"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => navigate('/employees')}
          >
            Add New Employee
          </Button>,
          <Button
            key="roster"
            type="default"
            icon={<CalendarOutlined />}
            onClick={() => navigate('/attendance')}
          >
            Daily Attendance Roster
          </Button>,
        ]}
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Active Workforce"
            value={empOverview.active || 0}
            icon={<TeamOutlined />}
            color="#2563eb"
            subtitle={`${empOverview.inactive || 0} inactive`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Present Today"
            value={attSummary.present || 0}
            icon={<ClockCircleOutlined />}
            color="#10b981"
            subtitle={`${attSummary.late || 0} clocked in late`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Absent Today"
            value={attSummary.absent || 0}
            icon={<CloseOutlined />}
            color="#ef4444"
            subtitle="Unscheduled absence"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Pending Requests"
            value={data?.pendingLeavesCount || 0}
            icon={<CalendarOutlined />}
            color="#f59e0b"
            subtitle="Requires manager action"
          />
        </Col>
      </Row>

      {/* Pending Leave Requests */}
      <Card className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              Leave Requests Awaiting Approval
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Decide on employee time-off and remote work applications
            </Text>
          </div>

          <Button type="link" size="small" onClick={() => navigate('/leaves')} style={{ fontSize: 12 }}>
            View All Leaves
          </Button>
        </div>

        <Table
          columns={leaveColumns}
          dataSource={pendingLeaves}
          rowKey="_id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No pending leave applications' }}
        />
      </Card>

      {/* Birthdays & New Joiners */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <GiftOutlined style={{ color: '#ec4899', fontSize: 18 }} />
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  Upcoming Birthdays This Month
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Celebrate colleague milestones
                </Text>
              </div>
            </div>

            <List
              dataSource={birthdays}
              locale={{ emptyText: <span style={{ color: '#94a3b8', fontSize: 12 }}>No upcoming birthdays this month</span> }}
              renderItem={(item) => (
                <List.Item style={{ padding: '10px 4px' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.profilePhoto}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#ec4899' }}
                      />
                    }
                    title={<span style={{ fontWeight: 600, fontSize: 13 }}>{item.fullName}</span>}
                    description={<span style={{ fontSize: 11, color: '#64748b' }}>{item.designation} • {item.department}</span>}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: isDarkMode ? '#1e293b' : '#fdf2f8',
                      color: '#db2777',
                    }}
                  >
                    {new Date(item.birthDate).toLocaleString('default', { month: 'short' })} {item.day}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <UserAddOutlined style={{ color: '#10b981', fontSize: 18 }} />
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  Recent Team Joiners
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Team members onboarded in the last 45 days
                </Text>
              </div>
            </div>

            <List
              dataSource={newJoiners}
              locale={{ emptyText: <span style={{ color: '#94a3b8', fontSize: 12 }}>No new joiners in the past 45 days</span> }}
              renderItem={(emp) => (
                <List.Item style={{ padding: '10px 4px' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={emp.profilePhoto}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#10b981' }}
                      />
                    }
                    title={<span style={{ fontWeight: 600, fontSize: 13 }}>{emp.fullName}</span>}
                    description={<span style={{ fontSize: 11, color: '#64748b' }}>{emp.designation} • {emp.department?.name || 'General'}</span>}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: isDarkMode ? '#1e293b' : '#f0fdf4',
                      color: '#15803d',
                    }}
                  >
                    Joined {new Date(emp.joiningDate).toLocaleDateString()}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal
        title="Reject Leave Application"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedLeaveId(null);
        }}
        onOk={handleRejectLeave}
        confirmLoading={actionLoading}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <p style={{ marginBottom: 10, fontSize: 13, color: '#64748b' }}>
          Please specify the rationale for rejecting this leave application:
        </p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Critical production release scheduled during this period."
        />
      </Modal>
    </div>
  );
};

export default HRDashboard;
