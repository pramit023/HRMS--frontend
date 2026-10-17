import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Avatar,
  Tag,
  Descriptions,
  Tabs,
  Button,
  Upload,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Spin,
  message,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi, attendanceApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin, isHR } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const fetchEmployee = async () => {
    try {
      const res = await employeeApi.getById(id);
      if (res?.data) {
        setEmployee(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await attendanceApi.getHistory(id, { limit: 15 });
      if (res?.data) {
        setAttendance(res.data.records || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmployee();
    fetchAttendance();
  }, [id]);

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await employeeApi.uploadPhoto(id, formData);
      message.success('Profile photo updated successfully');
      fetchEmployee();
    } catch (err) {
      message.error(err.message || 'Photo upload failed');
    }
    return false; // prevent default upload action
  };

  const handleDocumentUpload = async (values) => {
    if (!docFile) {
      return message.error('Please select a file to upload');
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('document', docFile);
    formData.append('name', values.name || docFile.name);

    try {
      await employeeApi.uploadDocument(id, formData);
      message.success('Document uploaded successfully');
      setDocModalOpen(false);
      docForm.resetFields();
      setDocFile(null);
      fetchEmployee();
    } catch (err) {
      message.error(err.message || 'Document upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await employeeApi.deleteDocument(id, docId);
      message.success('Document removed');
      fetchEmployee();
    } catch (err) {
      message.error(err.message || 'Failed to remove document');
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await employeeApi.delete(id);
      message.success('Employee permanently deleted');
      navigate('/employees', { replace: true });
    } catch (err) {
      message.error(err.message || 'Failed to delete employee');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading comprehensive employee file..." />
      </div>
    );
  }

  if (!employee) {
    return <div>Employee not found.</div>;
  }

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Clock In',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (t) => (t ? new Date(t).toLocaleTimeString() : '—'),
    },
    {
      title: 'Clock Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (t) => (t ? new Date(t).toLocaleTimeString() : '—'),
    },
    {
      title: 'Hours Worked',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (h) => `${h || 0} hrs`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <span
          className={
            s === 'Present'
              ? 'badge-active'
              : s === 'Late'
              ? 'badge-pending'
              : 'badge-rejected'
          }
        >
          {s}
        </span>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  const docColumns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <FilePdfOutlined style={{ color: '#ef4444', fontSize: 18 }} />
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            href={record.fileUrl}
            target="_blank"
            download
          >
            Download / View
          </Button>
          {(isSuperAdmin || isHR) && (
            <Popconfirm
              title="Delete Document"
              description="Are you sure you want to delete this document?"
              onConfirm={() => handleDeleteDocument(record._id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabs = [
    {
      key: '1',
      label: 'Personal & Contact Details',
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Full Legal Name">{employee.fullName}</Descriptions.Item>
          <Descriptions.Item label="Gender">{employee.gender}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Work Email">{employee.email}</Descriptions.Item>
          <Descriptions.Item label="Direct Phone">{employee.phone}</Descriptions.Item>
          <Descriptions.Item label="Employment Status">
            <span className={employee.status === 'Active' ? 'badge-active' : 'badge-inactive'}>
              {employee.status}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Residential Address" span={3}>
            {employee.address?.street}, {employee.address?.city}, {employee.address?.state}{' '}
            {employee.address?.zipCode}, {employee.address?.country}
          </Descriptions.Item>
          <Descriptions.Item label="Emergency Contact Name">
            {employee.emergencyContact?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Relationship">
            {employee.emergencyContact?.relationship || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Emergency Phone">
            {employee.emergencyContact?.phone || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: 'Job & Compensation',
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Department">{employee.department?.name || 'General'}</Descriptions.Item>
          <Descriptions.Item label="Designation / Role">{employee.designation}</Descriptions.Item>
          <Descriptions.Item label="Date of Joining">
            {new Date(employee.joiningDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Annual Base Salary">
            {isSuperAdmin || isHR ? (
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: 16 }}>
                ${(employee.salary || 0).toLocaleString()}
              </span>
            ) : (
              '••••••••'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Monthly Gross Equivalent">
            {isSuperAdmin || isHR ? `$${Math.round((employee.salary || 0) / 12).toLocaleString()}` : '••••••••'}
          </Descriptions.Item>
          <Descriptions.Item label="System Access Role">
            <span className="badge-purple">{employee.user?.role || 'Employee'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Bank Name">{employee.bankDetails?.bankName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Account Holder">{employee.bankDetails?.accountName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Account Number">{employee.bankDetails?.accountNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Routing / IFSC Code" span={3}>
            {employee.bankDetails?.routingOrIfsc || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '3',
      label: `Documents (${employee.documents?.length || 0})`,
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <Text type="secondary">Enterprise onboarding contracts, ID verifications, and compliance forms</Text>
            {(isSuperAdmin || isHR) && (
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setDocModalOpen(true)}>
                Upload New Document
              </Button>
            )}
          </div>
          <Table
            columns={docColumns}
            dataSource={employee.documents || []}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 550 }}
            locale={{ emptyText: 'No employee documents uploaded yet' }}
          />
        </div>
      ),
    },
    {
      key: '4',
      label: 'Recent Attendance Logs',
      children: (
        <Table
          columns={attendanceColumns}
          dataSource={attendance}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 600 }}
          locale={{ emptyText: 'No attendance records found' }}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title={employee.fullName}
        subtitle={`${employee.designation} • ${employee.department?.name || 'General'}`}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/employees')}
            >
              Back to Roster
            </Button>
            {(isSuperAdmin || isHR) && (
              <Popconfirm
                title="Delete Employee"
                description={`Permanently delete ${employee.fullName}? This will also delete their login account.`}
                onConfirm={handleDeleteEmployee}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete Employee
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
      />

      {/* Profile Overview Card */}
      <Card className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                size={80}
                src={employee.profilePhoto}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#2563eb' }}
              />
              <Upload
                beforeUpload={handlePhotoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  size="small"
                  shape="circle"
                  icon={<UploadOutlined />}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                />
              </Upload>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  {employee.fullName}
                </h2>
                <span className="badge-id">{employee.employeeId}</span>
                <span className={employee.status === 'Active' ? 'badge-active' : 'badge-inactive'}>
                  {employee.status}
                </span>
                <span className="badge-purple">
                  {employee.user?.role || 'Employee'}
                </span>
              </div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>
                {employee.email} • {employee.phone}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Tabbed Details */}
      <Card className="glass-card">
        <Tabs items={tabs} defaultActiveKey="1" />
      </Card>

      {/* Upload Document Modal */}
      <Modal
        title="Upload Employee Document"
        open={docModalOpen}
        width="min(500px, calc(100vw - 24px))"
        onCancel={() => {
          setDocModalOpen(false);
          setDocFile(null);
          docForm.resetFields();
        }}
        footer={null}
      >
        <Form form={docForm} layout="vertical" onFinish={handleDocumentUpload}>
          <Form.Item
            name="name"
            label="Document Name / Title"
            rules={[{ required: true, message: 'Please specify document title' }]}
          >
            <Input placeholder="e.g. 2026 Non-Disclosure Agreement (NDA)" />
          </Form.Item>

          <Form.Item label="Select File (PDF, DOCX, or Image)">
            <Upload
              beforeUpload={(file) => {
                setDocFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Choose File</Button>
            </Upload>
            {docFile && <div style={{ marginTop: 8, fontSize: 12, color: '#10b981' }}>Selected: {docFile.name}</div>}
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDocModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Upload Document
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeDetails;
