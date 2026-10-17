import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Tabs,
  Spin,
  message,
} from 'antd';
import {
  FileExcelOutlined,
  PrinterOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { reportApi, departmentApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportsHub = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Attendance Report State
  const [attDateRange, setAttDateRange] = useState([]);
  const [attDept, setAttDept] = useState('');
  const [attData, setAttData] = useState([]);

  // Leave Report State
  const [leaveStatus, setLeaveStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveData, setLeaveData] = useState([]);

  // Payroll Report State
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payMonth, setPayMonth] = useState('');
  const [payData, setPayData] = useState([]);

  // Employee Report State
  const [empData, setEmpData] = useState([]);

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res?.data) setDepartments(res.data);
    });
  }, []);

  // Fetch Attendance Report preview
  const fetchAttReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (attDateRange.length === 2) {
        params.startDate = attDateRange[0].format('YYYY-MM-DD');
        params.endDate = attDateRange[1].format('YYYY-MM-DD');
      }
      if (attDept) params.departmentId = attDept;

      const res = await reportApi.getAttendance(params);
      if (res?.data) {
        setAttData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Leave Report preview
  const fetchLeaveReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getLeave({
        status: leaveStatus,
        leaveType,
      });
      if (res?.data) {
        setLeaveData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Payroll Report preview
  const fetchPayReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getPayroll({
        year: payYear,
        month: payMonth,
      });
      if (res?.data) {
        setPayData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employee Report preview
  const fetchEmpReport = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getEmployee();
      if (res?.data) {
        setEmpData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '1') fetchAttReport();
    if (activeTab === '2') fetchLeaveReport();
    if (activeTab === '3') fetchPayReport();
    if (activeTab === '4') fetchEmpReport();
  }, [activeTab]);

  const generateDynamicColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <CalendarOutlined style={{ marginRight: 6 }} />
          Attendance Reports
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="glass-card" bodyStyle={{ padding: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={10}>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={(dates) => setAttDateRange(dates || [])}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Select
                  placeholder="All Departments"
                  value={attDept || undefined}
                  onChange={(v) => setAttDept(v)}
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
              <Col xs={24} sm={8}>
                <Space wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Button type="primary" onClick={fetchAttReport}>
                    Query
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                    href={reportApi.getExcelDownloadUrl('attendance', {
                      startDate: attDateRange[0]?.format('YYYY-MM-DD'),
                      endDate: attDateRange[1]?.format('YYYY-MM-DD'),
                      departmentId: attDept,
                    })}
                    target="_blank"
                  >
                    Export Excel (.xlsx)
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card className="glass-card">
            <Table
              columns={generateDynamicColumns(attData)}
              dataSource={attData}
              rowKey={(r, i) => i}
              loading={loading}
              scroll={{ x: 700 }}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No attendance data found for parameters' }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <ScheduleOutlined style={{ marginRight: 6 }} />
          Leave & Absence Reports
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="glass-card" bodyStyle={{ padding: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={12} sm={6}>
                <Select
                  placeholder="All Statuses"
                  value={leaveStatus || undefined}
                  onChange={(v) => setLeaveStatus(v)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="Approved">Approved</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6}>
                <Select
                  placeholder="All Leave Types"
                  value={leaveType || undefined}
                  onChange={(v) => setLeaveType(v)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="Casual Leave">Casual Leave</Option>
                  <Option value="Sick Leave">Sick Leave</Option>
                  <Option value="Earned Leave">Earned Leave</Option>
                  <Option value="Work From Home">Work From Home</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" onClick={fetchLeaveReport}>
                    Query
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                    href={reportApi.getExcelDownloadUrl('leave', {
                      status: leaveStatus,
                      leaveType,
                    })}
                    target="_blank"
                  >
                    Export Excel (.xlsx)
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card className="glass-card">
            <Table
              columns={generateDynamicColumns(leaveData)}
              dataSource={leaveData}
              rowKey={(r, i) => i}
              loading={loading}
              scroll={{ x: 700 }}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No leave data found' }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <DollarOutlined style={{ marginRight: 6 }} />
          Payroll & Tax Reports
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card className="glass-card" bodyStyle={{ padding: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={12} sm={6}>
                <Select
                  placeholder="Select Year"
                  value={payYear}
                  onChange={(v) => setPayYear(v)}
                  style={{ width: '100%' }}
                >
                  {[2024, 2025, 2026].map((y) => (
                    <Option key={y} value={y}>
                      {y}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={6}>
                <Select
                  placeholder="All Months"
                  value={payMonth || undefined}
                  onChange={(v) => setPayMonth(v)}
                  allowClear
                  style={{ width: '100%' }}
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
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                <Space wrap>
                  <Button type="primary" onClick={fetchPayReport}>
                    Query
                  </Button>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    style={{ background: '#10b981', borderColor: '#10b981' }}
                    href={reportApi.getExcelDownloadUrl('payroll', {
                      year: payYear,
                      month: payMonth,
                    })}
                    target="_blank"
                  >
                    Export Excel (.xlsx)
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card className="glass-card">
            <Table
              columns={generateDynamicColumns(payData)}
              dataSource={payData}
              rowKey={(r, i) => i}
              loading={loading}
              scroll={{ x: 700 }}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No payroll data found for period' }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <TeamOutlined style={{ marginRight: 6 }} />
          Employee Directory Roster
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981' }}
              href={reportApi.getExcelDownloadUrl('employee')}
              target="_blank"
            >
              Export Complete Employee Excel (.xlsx)
            </Button>
          </div>

          <Card className="glass-card">
            <Table
              columns={generateDynamicColumns(empData)}
              dataSource={empData}
              rowKey={(r, i) => i}
              loading={loading}
              scroll={{ x: 700 }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Reports & Analytics Hub"
        subtitle="Cross-functional operational data, payroll audits, compliance sheets, and Excel/PDF exports"
        extra={
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            Print View
          </Button>
        }
      />

      <Card className="glass-card">
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)} items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportsHub;
