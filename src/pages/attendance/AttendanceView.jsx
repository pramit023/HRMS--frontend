import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Avatar,
  Modal,
  Form,
  TimePicker,
  Input,
  message,
  Tabs,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DownloadOutlined,
  UserOutlined,
  EditOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { attendanceApi, departmentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Option } = Select;

const AttendanceView = () => {
  const { user, isSuperAdmin, isHR } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(isSuperAdmin || isHR ? '1' : '2');

  // Daily Roster State (HR / Admin)
  const [dailyDate, setDailyDate] = useState(dayjs());
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dailyData, setDailyData] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [dailyLoading, setDailyLoading] = useState(false);

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStats, setHistoryStats] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  // Manual Adjust Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [adjustForm] = Form.useForm();
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Today Clock Console State
  const [todayStatus, setTodayStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockLoading, setClockLoading] = useState(false);

  // Departments list for filter
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await attendanceApi.getDaily({
        date: dailyDate.format('YYYY-MM-DD'),
        department: selectedDept,
        status: selectedStatus,
      });
      if (res?.data) {
        setDailyData(res.data.records || []);
        setDailySummary(res.data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDailyLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await attendanceApi.getHistory('me', {
        month: selectedMonth,
        year: selectedYear,
      });
      if (res?.data) {
        setHistoryRecords(res.data.records || []);
        setHistoryStats(res.data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchToday = async () => {
    try {
      const res = await attendanceApi.getToday();
      if (res?.data) {
        setTodayStatus(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isSuperAdmin || isHR) {
      fetchDaily();
      departmentApi.getAll().then((res) => {
        if (res?.data) setDepartments(res.data);
      });
    }
    fetchHistory();
    fetchToday();
  }, [dailyDate, selectedDept, selectedStatus, selectedMonth, selectedYear]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkIn({});
      message.success('Checked in successfully!');
      fetchToday();
      fetchHistory();
      if (isSuperAdmin || isHR) fetchDaily();
    } catch (err) {
      message.error(err.message || 'Clock in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkOut();
      message.success('Checked out successfully!');
      fetchToday();
      fetchHistory();
      if (isSuperAdmin || isHR) fetchDaily();
    } catch (err) {
      message.error(err.message || 'Clock out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleOpenAdjustModal = (emp, att) => {
    setSelectedEmployee(emp);
    adjustForm.setFieldsValue({
      status: att?.status || 'Present',
      checkIn: att?.checkIn ? dayjs(att.checkIn) : null,
      checkOut: att?.checkOut ? dayjs(att.checkOut) : null,
      notes: att?.notes || '',
    });
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async () => {
    try {
      const values = await adjustForm.validateFields();
      setAdjustSubmitting(true);

      const checkInDate = values.checkIn
        ? dailyDate.hour(values.checkIn.hour()).minute(values.checkIn.minute()).toISOString()
        : null;

      const checkOutDate = values.checkOut
        ? dailyDate.hour(values.checkOut.hour()).minute(values.checkOut.minute()).toISOString()
        : null;

      await attendanceApi.manualEntry({
        employeeId: selectedEmployee._id,
        date: dailyDate.format('YYYY-MM-DD'),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: values.status,
        notes: values.notes,
      });

      message.success('Attendance updated');
      setAdjustModalOpen(false);
      fetchDaily();
    } catch (err) {
      message.error(err.message || 'Failed to update attendance');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    let cls = 'badge-active';
    if (status === 'Late') cls = 'badge-pending';
    if (status === 'Absent') cls = 'badge-rejected';
    if (status === 'On Leave') cls = 'badge-approved';
    return <span className={`status-pill ${cls}`}>{status}</span>;
  };

  // Daily roster columns
  const dailyColumns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <Space size={8}>
          <Avatar src={record.employee?.profilePhoto} icon={<UserOutlined />} size="small" style={{ backgroundColor: '#2563eb' }} />
          <div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{record.employee?.fullName}</span>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {record.employee?.employeeId} • {record.employee?.department?.name}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusBadge(record.attendance?.status || 'Absent'),
    },
    {
      title: 'Clock In',
      key: 'checkIn',
      render: (_, record) => (
        record.attendance?.checkIn ? (
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {dayjs(record.attendance.checkIn).format('hh:mm A')}
          </span>
        ) : '—'
      ),
    },
    {
      title: 'Clock Out',
      key: 'checkOut',
      render: (_, record) => (
        record.attendance?.checkOut ? (
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {dayjs(record.attendance.checkOut).format('hh:mm A')}
          </span>
        ) : '—'
      ),
    },
    {
      title: 'Working Hours',
      key: 'workingHours',
      render: (_, record) => (
        <span style={{ fontWeight: 600, fontSize: 12 }}>
          {record.attendance?.workingHours ? `${record.attendance.workingHours} hrs` : '0 hrs'}
        </span>
      ),
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => <span style={{ color: '#64748b', fontSize: 12 }}>{record.attendance?.notes || '—'}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ color: '#2563eb' }} />}
          onClick={() => handleOpenAdjustModal(record.employee, record.attendance)}
        >
          Adjust
        </Button>
      ),
    },
  ];

  // History columns
  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => <span style={{ fontWeight: 500 }}>{dayjs(d).format('ddd, MMM DD, YYYY')}</span>,
    },
    {
      title: 'Clock In',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (t) => (t ? <span style={{ fontFamily: 'monospace' }}>{dayjs(t).format('hh:mm A')}</span> : '—'),
    },
    {
      title: 'Clock Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (t) => (t ? <span style={{ fontFamily: 'monospace' }}>{dayjs(t).format('hh:mm A')}</span> : '—'),
    },
    {
      title: 'Hours Worked',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (h) => <span style={{ fontWeight: 600 }}>{h || 0} hrs</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => getStatusBadge(s),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (n) => <span style={{ color: '#64748b', fontSize: 12 }}>{n || 'Regular shift'}</span>,
    },
  ];

  const tabItems = [];

  if (isSuperAdmin || isHR) {
    tabItems.push({
      key: '1',
      label: 'Organization Daily Roster',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <StatCard
                title="Total Staff"
                value={dailySummary.totalEmployees || 0}
                icon={<UserOutlined />}
                color="#2563eb"
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                title="Present Today"
                value={dailySummary.present || 0}
                icon={<CheckCircleOutlined />}
                color="#10b981"
                subtitle={`${dailySummary.late || 0} Late`}
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                title="Absent Today"
                value={dailySummary.absent || 0}
                icon={<CloseCircleOutlined />}
                color="#ef4444"
              />
            </Col>
            <Col xs={12} sm={6}>
              <StatCard
                title="On Leave"
                value={dailySummary.onLeave || 0}
                icon={<CalendarOutlined />}
                color="#f59e0b"
              />
            </Col>
          </Row>

          {/* Filters */}
          <Card className="glass-card" bodyStyle={{ padding: 14 }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <DatePicker
                  value={dailyDate}
                  onChange={(d) => d && setDailyDate(d)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Select
                  placeholder="All Departments"
                  value={selectedDept || undefined}
                  onChange={(v) => setSelectedDept(v)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {departments.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={8} md={5}>
                <Select
                  placeholder="All Statuses"
                  value={selectedStatus || undefined}
                  onChange={(v) => setSelectedStatus(v)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="Present">Present</Option>
                  <Option value="Late">Late</Option>
                  <Option value="Absent">Absent</Option>
                  <Option value="On Leave">On Leave</Option>
                </Select>
              </Col>
              <Col xs={24} md={7} style={{ textAlign: 'right' }}>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  href={`/api/reports/attendance?format=excel&startDate=${dailyDate.format('YYYY-MM-DD')}&endDate=${dailyDate.format('YYYY-MM-DD')}`}
                  target="_blank"
                >
                  Export Daily Excel
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Table */}
          <Card className="glass-card">
            <Table
              columns={dailyColumns}
              dataSource={dailyData}
              rowKey={(r) => r.employee?._id}
              loading={dailyLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      ),
    });
  }

  tabItems.push({
    key: '2',
    label: 'My Monthly Attendance Log',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Month Selector & Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <StatCard
              title="Days Present"
              value={historyStats.presentDays || 0}
              icon={<CheckCircleOutlined />}
              color="#10b981"
              subtitle={`${historyStats.lateDays || 0} Late`}
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Total Logged Hours"
              value={`${historyStats.totalHours || 0}h`}
              icon={<ClockCircleOutlined />}
              color="#2563eb"
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Avg Daily Hours"
              value={`${historyStats.averageHours || 0}h`}
              icon={<ClockCircleOutlined />}
              color="#6366f1"
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Total Work Days"
              value={historyStats.totalDays || 0}
              icon={<CalendarOutlined />}
              color="#f59e0b"
            />
          </Col>
        </Row>

        <Card className="glass-card" bodyStyle={{ padding: 14 }}>
          <Space wrap>
            <Select
              value={selectedMonth}
              onChange={(m) => setSelectedMonth(m)}
              style={{ width: 140 }}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <Option key={idx + 1} value={idx + 1}>
                  {m}
                </Option>
              ))}
            </Select>
            <Select
              value={selectedYear}
              onChange={(y) => setSelectedYear(y)}
              style={{ width: 100 }}
            >
              {[2024, 2025, 2026].map((yr) => (
                <Option key={yr} value={yr}>
                  {yr}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        <Card className="glass-card">
          <Table
            columns={historyColumns}
            dataSource={historyRecords}
            rowKey="_id"
            loading={historyLoading}
            pagination={{ pageSize: 12 }}
            locale={{ emptyText: 'No attendance records for selected period' }}
          />
        </Card>
      </div>
    ),
  });

  tabItems.push({
    key: '3',
    label: 'Live Workstation Clock',
    children: (
      <Card className="glass-card" style={{ maxWidth: 440, margin: '20px auto', textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Today's Time Card
        </span>

        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 1,
            margin: '16px 0 4px 0',
            fontFamily: 'monospace',
            color: isDarkMode ? '#60a5fa' : '#2563eb',
          }}
        >
          {currentTime.toLocaleTimeString()}
        </div>
        <div style={{ color: '#64748b', marginBottom: 20, fontSize: 13 }}>
          {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <Space size={12}>
          {!todayStatus?.checkIn ? (
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              loading={clockLoading}
              onClick={handleClockIn}
              style={{
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                height: 44,
                padding: '0 28px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Clock In Now
            </Button>
          ) : !todayStatus?.checkOut ? (
            <Button
              type="primary"
              danger
              size="large"
              icon={<ClockCircleOutlined />}
              loading={clockLoading}
              onClick={handleClockOut}
              style={{
                height: 44,
                padding: '0 28px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Clock Out Now
            </Button>
          ) : (
            <span className="status-pill badge-active" style={{ fontSize: 13, padding: '4px 12px' }}>
              Shift Complete: {todayStatus.workingHours} Hours Logged
            </span>
          )}
        </Space>

        {todayStatus && (
          <div style={{ marginTop: 20, textAlign: 'left', background: isDarkMode ? '#1e293b' : '#f8fafc', padding: 14, borderRadius: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Status:</span>
              {getStatusBadge(todayStatus.status)}
            </div>
            {todayStatus.checkIn && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Clock In:</span>
                <span style={{ fontFamily: 'monospace' }}>{new Date(todayStatus.checkIn).toLocaleTimeString()}</span>
              </div>
            )}
            {todayStatus.checkOut && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Clock Out:</span>
                <span style={{ fontFamily: 'monospace' }}>{new Date(todayStatus.checkOut).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </Card>
    ),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Attendance & Working Hours"
        subtitle="Daily organization attendance roster, individual monthly time logs, and manual HR adjustments"
      />

      <Card className="glass-card">
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)} items={tabItems} />
      </Card>

      {/* Manual Override Modal */}
      <Modal
        title={`Adjust Attendance: ${selectedEmployee?.fullName}`}
        open={adjustModalOpen}
        onCancel={() => setAdjustModalOpen(false)}
        onOk={handleSaveAdjust}
        confirmLoading={adjustSubmitting}
      >
        <Form form={adjustForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="status" label="Attendance Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Present">Present</Option>
              <Option value="Late">Late</Option>
              <Option value="Half Day">Half Day</Option>
              <Option value="Absent">Absent</Option>
              <Option value="On Leave">On Leave</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="checkIn" label="Clock In Time">
                <TimePicker format="hh:mm A" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="checkOut" label="Clock Out Time">
                <TimePicker format="hh:mm A" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Audit Reason / Override Note">
            <Input.TextArea rows={2} placeholder="Explain reason for manual adjustment..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceView;
