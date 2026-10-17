import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Typography,
  message,
  Row,
  Col,
  Popconfirm,
  Statistic,
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { documentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const DocumentsView = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadForm] = Form.useForm();

  const isPrivileged = ['Super Admin', 'HR Manager', 'HR Admin'].includes(user?.role);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.documentType = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await documentApi.getAll(params);
      if (res?.data) {
        setDocuments(res.data);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, statusFilter]);

  const handleUploadSubmit = async (values) => {
    if (fileList.length === 0) {
      message.warning('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      formData.append('title', values.title);
      formData.append('documentType', values.documentType);

      await documentApi.upload(formData);
      message.success('Document uploaded successfully!');
      setUploadModalOpen(false);
      setFileList([]);
      uploadForm.resetFields();
      fetchDocuments();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc) => {
    const url = documentApi.getDownloadUrl(doc._id);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.fileName || doc.title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerify = async (id, status) => {
    try {
      await documentApi.verify(id, { status });
      message.success(`Document marked as ${status}`);
      fetchDocuments();
    } catch (err) {
      message.error('Failed to update verification status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentApi.delete(id);
      message.success('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType = '', fileName = '') => {
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ fontSize: 24, color: '#ef4444' }} />;
    }
    if (mimeType.includes('word') || fileName.match(/\.docx?$/i)) {
      return <FileWordOutlined style={{ fontSize: 24, color: '#2563eb' }} />;
    }
    if (mimeType.includes('image') || fileName.match(/\.(png|jpe?g|webp)$/i)) {
      return <FileImageOutlined style={{ fontSize: 24, color: '#10b981' }} />;
    }
    return <FileTextOutlined style={{ fontSize: 24, color: '#64748b' }} />;
  };

  const getStatusBadge = (status) => {
    const map = {
      Verified: { color: 'success', icon: <CheckCircleOutlined /> },
      Pending: { color: 'warning', icon: <ClockCircleOutlined /> },
      Rejected: { color: 'error', icon: <CloseCircleOutlined /> },
    };
    const cfg = map[status] || { color: 'default' };
    return (
      <Tag color={cfg.color} icon={cfg.icon}>
        {status}
      </Tag>
    );
  };

  // Metrics
  const totalDocs = documents.length;
  const verifiedDocs = documents.filter((d) => d.status === 'Verified').length;
  const pendingDocs = documents.filter((d) => d.status === 'Pending').length;

  const columns = [
    {
      title: 'Document',
      key: 'title',
      render: (_, record) => (
        <Space size="middle" align="center">
          {getFileIcon(record.mimeType, record.fileName)}
          <div>
            <Text strong style={{ fontSize: 14 }}>
              {record.title}
            </Text>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {record.fileName} • {formatFileSize(record.fileSize)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    ...(isPrivileged
      ? [
          {
            title: 'Employee',
            key: 'employee',
            render: (_, record) => (
              <span>
                {record.employee?.fullName || 'N/A'} ({record.employee?.employeeId})
              </span>
            ),
          },
        ]
      : []),
    {
      title: 'Uploaded On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Verification Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Download
          </Button>

          {isPrivileged && record.status === 'Pending' && (
            <>
              <Button
                size="small"
                type="link"
                style={{ color: '#16a34a' }}
                onClick={() => handleVerify(record._id, 'Verified')}
              >
                Approve
              </Button>
              <Button
                size="small"
                type="link"
                danger
                onClick={() => handleVerify(record._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}

          <Popconfirm
            title="Delete Document"
            description="Are you sure you want to remove this document?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {isPrivileged ? 'Enterprise Document Repository' : 'My Uploaded Documents'}
          </Title>
          <Text type="secondary">
            {isPrivileged
              ? 'Access, verify, and govern employee legal records and onboarding files.'
              : 'Upload and access your identity proofs, educational degrees, and contracts.'}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setUploadModalOpen(true)}
          style={{ borderRadius: 6 }}
        >
          Upload Document
        </Button>
      </div>

      {/* Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Total Stored Documents" value={totalDocs} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Verified Records"
              value={verifiedDocs}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Pending Verification"
              value={pendingDocs}
              valueStyle={{ color: '#d97706' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search & Filters */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by title or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchDocuments}
              allowClear
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Category"
              allowClear
              value={typeFilter || undefined}
              onChange={(val) => setTypeFilter(val || '')}
            >
              <Option value="ID Proof">ID Proof</Option>
              <Option value="Offer Letter">Offer Letter</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Certificate">Certificate</Option>
              <Option value="Payslip">Payslip</Option>
              <Option value="Tax Document">Tax Document</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>
          <Col xs={12} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              allowClear
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
            >
              <Option value="Verified">Verified</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button onClick={fetchDocuments} block>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 720 }}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Corporate Document"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        destroyOnClose
        width="min(560px, calc(100vw - 24px))"
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleUploadSubmit}>
          <Form.Item
            name="title"
            label="Document Title"
            rules={[{ required: true, message: 'Please provide a descriptive title' }]}
          >
            <Input placeholder="e.g. Passport Copy / Master Degree" />
          </Form.Item>

          <Form.Item
            name="documentType"
            label="Document Category"
            initialValue="ID Proof"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="ID Proof">ID Proof (Passport, Driving License, National ID)</Option>
              <Option value="Offer Letter">Signed Offer Letter</Option>
              <Option value="Contract">Employment Contract</Option>
              <Option value="Certificate">Degree / Professional Certificate</Option>
              <Option value="Tax Document">Tax / Bank Statement</Option>
              <Option value="Other">Other Supporting Document</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Select File (PDF, DOCX, PNG, JPG - Max 10MB)">
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false; // Prevent automatic upload
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Choose File</Button>
            </Upload>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Upload & Submit
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentsView;
