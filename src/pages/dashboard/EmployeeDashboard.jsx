import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Avatar,
  Button,
  Space,
  Table,
  Spin,
  Progress,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { dashboardApi, attendanceApi, leaveApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [leaveForm] = Form.useForm();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getEmployee();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Employee Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkIn({});
      message.success('Checked in successfully!');
      fetchDashboard();
    } catch (err) {
      message.error(err.message || 'Check-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkOut();
      message.success('Checked out successfully!');
      fetchDashboard();
    } catch (err) {
      message.error(err.message || 'Check-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleApplyLeave = async (values) => {
    try {
      const [start, end] = values.dates;
      await leaveApi.apply({
        leaveType: values.leaveType,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        reason: values.reason,
      });
      message.success('Leave application submitted!');
      setLeaveModalOpen(false);
      leaveForm.resetFields();
      fetchDashboard();
    } catch (err) {
      message.error(err.message || 'Failed to submit leave');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading your workspace..." />
      </div>
    );
  }

  const profile = data?.profile || {};
  const todayAtt = data?.todayAttendance;
  const attSummary = data?.attendanceSummary || {};
  const leaveBalance = data?.leaveBalance || {};
  const salaryHistory = data?.salaryHistory || [];

  const payrollColumns = [
    {
      title: 'Pay Period',
      dataIndex: 'payPeriod',
      key: 'payPeriod',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Gross Salary',
      dataIndex: 'grossEarnings',
      key: 'grossEarnings',
      render: (val) => `$${(val || 0).toLocaleString()}`,
    },
    {
      title: 'Deductions',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      render: (val) => <span style={{ color: '#ef4444' }}>-${(val || 0).toLocaleString()}</span>,
    },
    {
      title: 'Net Disbursed',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (val) => <span style={{ fontWeight: 700, color: '#10b981' }}>${(val || 0).toLocaleString()}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <span className={`status-pill ${status === 'Paid' ? 'badge-active' : 'badge-pending'}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Payslip',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          href={`/api/payroll/${record._id}/download-pdf`}
          target="_blank"
          style={{ borderRadius: 6, fontSize: 12, height: 28 }}
        >
          Download PDF
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Employee Self-Service"
        subtitle={`Welcome back, ${profile.firstName || user?.name}! Track your work hours, leaves, and compensation statements.`}
        extra={[
          <Button
            key="leave"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setLeaveModalOpen(true)}
          >
            Apply for Leave / WFH
          </Button>,
        ]}
      />

      {/* Profile Banner & Workstation Clock */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <Avatar
                size={76}
                src={profile.profilePhoto}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#2563eb',
                  border: '2px solid #93c5fd',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                    {profile.fullName || user?.name}
                  </Title>
                  <span className="status-pill badge-approved">{profile.employeeId || 'EMP-1000'}</span>
                  <span className="status-pill badge-active">{profile.status || 'Active'}</span>
                </div>

                <div style={{ color: '#2563eb', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {profile.designation} • {profile.department?.name || 'General Division'}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span><MailOutlined style={{ marginRight: 5, color: '#94a3b8' }} />{profile.email}</span>
                  <span><PhoneOutlined style={{ marginRight: 5, color: '#94a3b8' }} />{profile.phone}</span>
                  <span><EnvironmentOutlined style={{ marginRight: 5, color: '#94a3b8' }} />{profile.department?.location || 'Headquarters'}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Live Workstation Clock */}
        <Col xs={24} lg={9}>
          <Card className="glass-card" style={{ height: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Attendance & Time Tracker
            </span>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 1,
                margin: '8px 0 2px 0',
                fontFamily: 'monospace',
                color: isDarkMode ? '#60a5fa' : '#2563eb',
              }}
            >
              {currentTime.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            <Space size={10}>
              {!todayAtt?.checkIn ? (
                <Button
                  type="primary"
                  icon={<FieldTimeOutlined />}
                  loading={clockLoading}
                  onClick={handleCheckIn}
                  style={{
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    borderRadius: 6,
                    fontWeight: 600,
                    height: 34,
                    padding: '0 20px',
                  }}
                >
                  Clock In Today
                </Button>
              ) : !todayAtt?.checkOut ? (
                <Button
                  type="primary"
                  danger
                  icon={<ClockCircleOutlined />}
                  loading={clockLoading}
                  onClick={handleCheckOut}
                  style={{ borderRadius: 6, fontWeight: 600, height: 34, padding: '0 20px' }}
                >
                  Clock Out
                </Button>
              ) : (
                <span className="status-pill badge-active">
                  Completed Today ({todayAtt.workingHours}h Logged)
                </span>
              )}
            </Space>

            {todayAtt?.checkIn && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>
                Clocked in at {new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayAtt.status})
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Days Present"
            value={attSummary.presentDays || 0}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            subtitle={`${attSummary.lateDays || 0} late check-ins`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Working Hours"
            value={`${attSummary.totalHours || 0}h`}
            icon={<ClockCircleOutlined />}
            color="#2563eb"
            subtitle="Logged this month"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Leave Balance"
            value={`${(leaveBalance.casualLeave || 0) + (leaveBalance.sickLeave || 0)}`}
            icon={<CalendarOutlined />}
            color="#f59e0b"
            subtitle={`${leaveBalance.casualLeave || 0} Casual / ${leaveBalance.sickLeave || 0} Sick`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Work From Home"
            value={`${leaveBalance.workFromHome || 0} Days`}
            icon={<UserOutlined />}
            color="#6366f1"
            subtitle={`${leaveBalance.earnedLeave || 0} Earned Leaves`}
          />
        </Col>
      </Row>

      {/* Leave Quota Visual Progress */}
      <Card className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              Leave Quota & Paid Time-Off Allowances
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Annual allocated quotas and remaining available days
            </Text>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Casual Leave</span>
              <Progress
                type="circle"
                percent={Math.round(((leaveBalance.casualLeave || 0) / 12) * 100)}
                format={() => `${leaveBalance.casualLeave || 0}/12`}
                strokeColor="#2563eb"
                width={68}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Sick Leave</span>
              <Progress
                type="circle"
                percent={Math.round(((leaveBalance.sickLeave || 0) / 10) * 100)}
                format={() => `${leaveBalance.sickLeave || 0}/10`}
                strokeColor="#ef4444"
                width={68}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Earned Leave</span>
              <Progress
                type="circle"
                percent={Math.round(((leaveBalance.earnedLeave || 0) / 15) * 100)}
                format={() => `${leaveBalance.earnedLeave || 0}/15`}
                strokeColor="#10b981"
                width={68}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ border: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13, display: 'block', marginBottom: 6 }}>Work From Home</span>
              <Progress
                type="circle"
                percent={Math.round(((leaveBalance.workFromHome || 0) / 24) * 100)}
                format={() => `${leaveBalance.workFromHome || 0}/24`}
                strokeColor="#6366f1"
                width={68}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Salary History */}
      <Card className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <DollarOutlined style={{ color: '#10b981', fontSize: 16 }} />
            <div>
              <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                Compensation History & Verified Payslips
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Monthly salary vouchers generated for direct download
              </Text>
            </div>
          </Space>
        </div>

        <Table
          columns={payrollColumns}
          dataSource={salaryHistory}
          rowKey="_id"
          pagination={false}
          size="middle"
          scroll={{ x: 650 }}
          locale={{ emptyText: 'No salary records generated yet' }}
        />
      </Card>

      {/* Apply Leave Modal */}
      <Modal
        title="Submit Time-Off Application"
        open={leaveModalOpen}
        onCancel={() => setLeaveModalOpen(false)}
        width="min(520px, calc(100vw - 24px))"
        footer={null}
      >
        <Form form={leaveForm} layout="vertical" onFinish={handleApplyLeave}>
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select leave type' }]}
          >
            <Select placeholder="Select leave category">
              <Option value="Casual Leave">Casual Leave</Option>
              <Option value="Sick Leave">Sick Leave</Option>
              <Option value="Earned Leave">Earned Leave</Option>
              <Option value="Work From Home">Work From Home (WFH)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dates"
            label="Date Range"
            rules={[{ required: true, message: 'Please select start and end dates' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Absence"
            rules={[{ required: true, message: 'Please provide reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Please describe reason for leave..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
