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
  InputNumber,
  Input,
  message,
  Descriptions,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { payrollApi, departmentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const monthsList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PayrollManagement = () => {
  const { user, isSuperAdmin, isHR } = useAuth();
  const { isDarkMode } = useTheme();

  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState({});
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateForm] = Form.useForm();

  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await payrollApi.getAll({
        page,
        limit: 10,
        month: selectedMonth,
        year: selectedYear,
        status: selectedStatus,
      });
      if (res?.data) {
        setPayrolls(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (isSuperAdmin || isHR) {
      try {
        const res = await payrollApi.getSummary();
        if (res?.data) {
          setSummary(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    departmentApi.getAll().then((res) => {
      if (res?.data) setDepartments(res.data);
    });
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [page, selectedMonth, selectedYear, selectedStatus]);

  const handleGeneratePayroll = async (values) => {
    setGenerateLoading(true);
    try {
      const res = await payrollApi.generate(values);
      message.success(res.message || 'Payroll generated successfully!');
      setGenerateModalOpen(false);
      generateForm.resetFields();
      fetchPayrolls();
      fetchSummary();
    } catch (err) {
      message.error(err.message || 'Failed to generate payroll');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleOpenEdit = (p) => {
    setSelectedPayroll(p);
    editForm.setFieldsValue({
      bonus: p.bonus || 0,
      otherDeductions: p.otherDeductions || 0,
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
      notes: p.notes,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditSubmitting(true);
      await payrollApi.update(selectedPayroll._id, values);
      message.success('Payroll updated successfully');
      setEditModalOpen(false);
      fetchPayrolls();
      fetchSummary();
    } catch (err) {
      message.error(err.message || 'Failed to update payroll');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollApi.update(id, { paymentStatus: 'Paid' });
      message.success('Payment status marked as Paid');
      fetchPayrolls();
      fetchSummary();
    } catch (err) {
      message.error(err.message || 'Failed to mark as paid');
    }
  };

  const columns = [
    {
      title: 'Pay Period',
      dataIndex: 'payPeriod',
      key: 'payPeriod',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    ...(isSuperAdmin || isHR
      ? [
          {
            title: 'Employee',
            key: 'employee',
            render: (_, record) => (
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{record.employee?.fullName}</span>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {record.employee?.employeeId} • {record.employee?.department?.name}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      title: 'Gross Earnings',
      dataIndex: 'grossEarnings',
      key: 'grossEarnings',
      render: (val) => `$${(val || 0).toLocaleString()}`,
    },
    {
      title: 'Deductions (Tax + PF)',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      render: (val) => <span style={{ color: '#ef4444' }}>-${(val || 0).toLocaleString()}</span>,
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (val) => (
        <span style={{ fontWeight: 700, color: '#10b981', fontSize: 14 }}>
          ${(val || 0).toLocaleString()}
        </span>
      ),
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={6}>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: 6, fontSize: 12, height: 28 }}
            onClick={() => {
              setSelectedPayroll(record);
              setBreakdownModalOpen(true);
            }}
          >
            Breakdown
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            href={`/api/payroll/${record._id}/download-pdf`}
            target="_blank"
            style={{ borderRadius: 6, fontSize: 12, height: 28 }}
          >
            PDF Slip
          </Button>

          {(isSuperAdmin || isHR) && (
            <>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ color: '#2563eb' }} />}
                onClick={() => handleOpenEdit(record)}
              />
              {record.paymentStatus !== 'Paid' && (
                <Button
                  size="small"
                  type="text"
                  icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                  onClick={() => handleMarkPaid(record._id)}
                >
                  Pay
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Payroll & Compensation Processing"
        subtitle="Batch salary generation, tax withholding, compensation adjustments, and digital PDF salary slips"
        extra={[
          (isSuperAdmin || isHR) && (
            <Button
              key="export"
              type="default"
              icon={<DownloadOutlined />}
              href="/api/reports/payroll?format=excel"
              target="_blank"
            >
              Export Excel
            </Button>
          ),
          (isSuperAdmin || isHR) && (
            <Button
              key="generate"
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => setGenerateModalOpen(true)}
            >
              Generate Monthly Payroll
            </Button>
          ),
        ]}
      />

      {/* KPI Cards for HR / Admin */}
      {(isSuperAdmin || isHR) && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <StatCard
              title="Disbursed YTD"
              value={`$${(summary.totalDisbursed || 0).toLocaleString()}`}
              icon={<DollarOutlined />}
              color="#10b981"
              subtitle="Paid to staff bank accounts"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Pending Disbursement"
              value={`$${(summary.pendingDisbursed || 0).toLocaleString()}`}
              icon={<CalendarOutlined />}
              color="#f59e0b"
              subtitle="Awaiting final approval"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatCard
              title="Tax Withholding (TDS)"
              value={`$${(summary.totalTax || 0).toLocaleString()}`}
              icon={<ThunderboltOutlined />}
              color="#2563eb"
              subtitle="Compliance tax reserves"
            />
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="glass-card" bodyStyle={{ padding: 14 }}>
        <div className="filter-bar-responsive">
          <Select
            placeholder="Select Month"
            value={selectedMonth}
            onChange={(m) => setSelectedMonth(m)}
            style={{ minWidth: 140, flex: '1 1 140px' }}
          >
            {monthsList.map((m, idx) => (
              <Option key={idx + 1} value={idx + 1}>
                {m}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Year"
            value={selectedYear}
            onChange={(y) => setSelectedYear(y)}
            style={{ minWidth: 100, flex: '1 1 100px' }}
          >
            {[2024, 2025, 2026].map((yr) => (
              <Option key={yr} value={yr}>
                {yr}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="All Statuses"
            value={selectedStatus || undefined}
            onChange={(s) => setSelectedStatus(s)}
            allowClear
            style={{ minWidth: 140, flex: '1 1 140px' }}
          >
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={payrolls}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (p) => setPage(p),
          }}
          locale={{ emptyText: 'No payroll records found for this period' }}
        />
      </Card>

      {/* Batch Generate Payroll Modal */}
      <Modal
        title="Batch Generate Monthly Payroll"
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        footer={null}
        width="min(560px, calc(100vw - 24px))"
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGeneratePayroll}
          initialValues={{
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          }}
          style={{ marginTop: 12 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="month" label="Payroll Month" rules={[{ required: true }]}>
                <Select>
                  {monthsList.map((m, idx) => (
                    <Option key={idx + 1} value={idx + 1}>
                      {m}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year" label="Payroll Year" rules={[{ required: true }]}>
                <Select>
                  {[2024, 2025, 2026].map((yr) => (
                    <Option key={yr} value={yr}>
                      {yr}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="departmentId" label="Target Department (Leave blank for all active staff)">
            <Select placeholder="All Company Departments" allowClear>
              {departments.map((d) => (
                <Option key={d._id} value={d._id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div
            style={{
              background: isDarkMode ? '#1e293b' : '#eff6ff',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 12,
              color: isDarkMode ? '#93c5fd' : '#1e40af',
            }}
          >
            💡 Auto-calculates Basic (50%), HRA (20%), Allowances (20%), Tax (10%), and PF (12% of Basic) based on each active employee's salary record.
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setGenerateModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={generateLoading}>
                Generate Payroll
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Salary Breakdown Modal */}
      <Modal
        title={`Salary Breakdown: ${selectedPayroll?.payPeriod}`}
        open={breakdownModalOpen}
        onCancel={() => setBreakdownModalOpen(false)}
        footer={[
          <Button
            key="pdf"
            type="primary"
            icon={<DownloadOutlined />}
            href={`/api/payroll/${selectedPayroll?._id}/download-pdf`}
            target="_blank"
          >
            Download PDF Payslip
          </Button>,
          <Button key="close" onClick={() => setBreakdownModalOpen(false)}>
            Close
          </Button>,
        ]}
        width="min(650px, calc(100vw - 24px))"
      >
        {selectedPayroll && (
          <div>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Employee">
                {selectedPayroll.employee?.fullName} ({selectedPayroll.employee?.employeeId})
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedPayroll.employee?.department?.name || 'General'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Status">
                <span className={`status-pill ${selectedPayroll.paymentStatus === 'Paid' ? 'badge-active' : 'badge-pending'}`}>
                  {selectedPayroll.paymentStatus}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedPayroll.paymentMethod}
              </Descriptions.Item>
            </Descriptions>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card size="small" title="Earnings Breakdown" style={{ background: isDarkMode ? '#0d1929' : '#f0f9ff', borderColor: isDarkMode ? '#1e3a5f' : '#bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Basic Salary:</span>
                    <strong>${(selectedPayroll.basicSalary || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>HRA:</span>
                    <strong>${(selectedPayroll.hra || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Allowances:</span>
                    <strong>${(selectedPayroll.allowances || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Bonus:</span>
                    <strong>${(selectedPayroll.bonus || 0).toLocaleString()}</strong>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#2563eb', fontSize: 14 }}>
                    <span>Gross Earnings:</span>
                    <span>${(selectedPayroll.grossEarnings || 0).toLocaleString()}</span>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card size="small" title="Deductions Breakdown" style={{ background: isDarkMode ? '#221115' : '#fef2f2', borderColor: isDarkMode ? '#4a151b' : '#fecaca' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Income Tax (TDS):</span>
                    <strong>${(selectedPayroll.taxDeduction || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Provident Fund (PF):</span>
                    <strong>${(selectedPayroll.pfDeduction || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span>Other Deductions:</span>
                    <strong>${(selectedPayroll.otherDeductions || 0).toLocaleString()}</strong>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#dc2626', fontSize: 14 }}>
                    <span>Total Deductions:</span>
                    <span>${(selectedPayroll.totalDeductions || 0).toLocaleString()}</span>
                  </div>
                </Card>
              </Col>
            </Row>

            <div
              style={{
                marginTop: 16,
                background: '#0f172a',
                color: '#fff',
                padding: '14px 18px',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Salary Disbursed</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8' }}>
                  ${(selectedPayroll.netSalary || 0).toLocaleString()}
                </div>
              </div>
              <span className="status-pill badge-approved">{selectedPayroll.paymentMethod}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Payroll Modal */}
      <Modal
        title="Adjust Payroll Bonuses & Deductions"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveEdit}
        confirmLoading={editSubmitting}
        width="min(540px, calc(100vw - 24px))"
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="bonus" label="Bonus Amount ($)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="otherDeductions" label="Other Deductions ($)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentStatus" label="Payment Status">
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Processing">Processing</Option>
                  <Option value="Paid">Paid</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentMethod" label="Disbursement Method">
                <Select>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Direct Deposit">Direct Deposit</Option>
                  <Option value="Cheque">Cheque</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes / Comments">
            <Input.TextArea rows={2} placeholder="Optional notes for payslip" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PayrollManagement;
