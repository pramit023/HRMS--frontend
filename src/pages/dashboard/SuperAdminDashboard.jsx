import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Space, Button, Spin } from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { dashboardApi } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;

const PIE_COLORS = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getSuperAdmin();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Super Admin Dashboard Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading executive overview..." />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const hiringStats = data?.hiringStats || [];
  const deptData = data?.departmentDistribution || [];
  const auditLogs = data?.recentActivities || [];

  const auditColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        let cls = 'badge-approved';
        if (action.includes('CREATE')) cls = 'badge-active';
        if (action.includes('DELETE')) cls = 'badge-rejected';
        return <span className={`status-pill ${cls}`}>{action}</span>;
      },
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (mod) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            background: isDarkMode ? '#1e293b' : '#f1f5f9',
            color: isDarkMode ? '#94a3b8' : '#475569',
          }}
        >
          {mod}
        </span>
      ),
    },
    {
      title: 'Actor',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <span>
          <strong style={{ fontSize: 13 }}>{name}</strong>{' '}
          <span style={{ fontSize: 11, color: '#94a3b8' }}>({record.userRole})</span>
        </span>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
          {ip || '127.0.0.1'}
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t) => (
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
          {new Date(t).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Executive Overview"
        subtitle="Workforce analytics, real-time presence, department distribution, and audit log"
        extra={[
          <Button
            key="emp"
            type="default"
            icon={<UserAddOutlined />}
            onClick={() => navigate('/employees')}
          >
            Manage Employees
          </Button>,
          <Button
            key="payroll"
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => navigate('/payroll')}
          >
            Payroll Console
          </Button>,
        ]}
      />

      {/* Primary KPI Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Workforce"
            value={metrics.totalEmployees || 0}
            icon={<TeamOutlined />}
            color="#2563eb"
            subtitle={`${metrics.activeEmployees || 0} active staff`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Departments"
            value={metrics.totalDepartments || 0}
            icon={<ApartmentOutlined />}
            color="#6366f1"
            subtitle="Business units"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Present Today"
            value={metrics.presentToday || 0}
            icon={<CheckCircleOutlined />}
            color="#10b981"
            trend="up"
            trendValue="100%"
            subtitle="Clocked in staff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="On Leave Today"
            value={metrics.onLeaveToday || 0}
            icon={<CalendarOutlined />}
            color="#f59e0b"
            subtitle="Approved time-off"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  Workforce Growth & Hiring Activity
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cumulative headcount and new joiners over the past 6 months
                </Text>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: isDarkMode ? '#1e293b' : '#f1f5f9',
                  color: isDarkMode ? '#94a3b8' : '#475569',
                }}
              >
                Past 6 Months
              </span>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiringStats}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                      borderColor: isDarkMode ? '#1f293d' : '#e2e8f0',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="totalEmployees"
                    name="Headcount"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                  />
                  <Bar dataKey="hires" name="New Hires" fill="#10b981" radius={[4, 4, 0, 0]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  Department Distribution
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Headcount distribution across company units
                </Text>
              </div>
              <Button type="link" size="small" onClick={() => navigate('/departments')} style={{ fontSize: 12, padding: 0 }}>
                View Roster
              </Button>
            </div>

            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                      borderColor: isDarkMode ? '#1f293d' : '#e2e8f0',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Security & Audit Feed */}
      <Card className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: 16 }} />
            <div>
              <Title level={5} style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                System Activity & Security Audit Trail
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Recent administrative and authentication transactions
              </Text>
            </div>
          </Space>

          <Button type="default" size="small" onClick={() => navigate('/audit')}>
            View All Audit Logs
          </Button>
        </div>

        <Table
          columns={auditColumns}
          dataSource={auditLogs}
          rowKey="_id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No recent audit events' }}
        />
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
