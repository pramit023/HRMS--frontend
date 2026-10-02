import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Table,
  Button,
  Tag,
  Rate,
  Progress,
  Space,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Slider,
  message,
  Divider,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { performanceApi, employeeApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const PerformanceReviews = () => {
  const { user, isSuperAdmin, isHR } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await performanceApi.getAll();
      if (res?.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
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
    fetchReviews();
    if (isSuperAdmin || isHR) {
      fetchEmployees();
    }
  }, []);

  const handleCreateReview = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        employeeId: values.employeeId,
        reviewPeriod: values.reviewPeriod,
        rating: values.rating,
        metrics: {
          technicalSkills: values.technicalSkills || 4,
          communication: values.communication || 4,
          leadership: values.leadership || 4,
          punctuality: values.punctuality || 5,
          workQuality: values.workQuality || 4,
        },
        goals: [
          {
            title: values.goalTitle || 'Primary Strategic Objective',
            progress: values.goalProgress || 80,
            status: values.goalProgress === 100 ? 'Completed' : 'In Progress',
          },
        ],
        strengths: values.strengths || '',
        areasForImprovement: values.areasForImprovement || '',
        feedback: values.feedback || '',
        status: 'Approved',
      };

      await performanceApi.create(payload);
      message.success('Performance review recorded successfully');
      setModalOpen(false);
      form.resetFields();
      fetchReviews();
    } catch (err) {
      message.error(err.message || 'Failed to create review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.employee?.profilePhoto}
            icon={<UserOutlined />}
            size="small"
            style={{ backgroundColor: '#0284c7' }}
          />
          <div>
            <span style={{ fontWeight: 600 }}>{record.employee?.fullName}</span>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {record.employee?.employeeId} • {record.employee?.designation}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Review Period',
      dataIndex: 'reviewPeriod',
      key: 'reviewPeriod',
      render: (p) => <span className="badge-blue">{p}</span>,
    },
    {
      title: 'Overall Score',
      dataIndex: 'rating',
      key: 'rating',
      render: (r) => (
        <Space>
          <Rate disabled defaultValue={r} count={5} style={{ fontSize: 14 }} />
          <span style={{ fontWeight: 600 }}>({r}/5)</span>
        </Space>
      ),
    },
    {
      title: 'Key Objectives & Goals',
      key: 'goals',
      render: (_, record) => (
        <div>
          {record.goals && record.goals.length > 0 ? (
            <div>
              <span style={{ fontSize: 12 }}>{record.goals[0].title}</span>
              <Progress percent={record.goals[0].progress} size="small" status="active" />
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>No goals defined</span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <span className={s === 'Approved' ? 'badge-active' : 'badge-pending'}>
          {s}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedReview(record);
            setDetailsModalOpen(true);
          }}
        >
          View Appraisal
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Performance & Appraisals"
        subtitle="Continuous employee feedback, quarterly appraisal cycles, and KPI tracking"
        extra={
          (isSuperAdmin || isHR) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
            >
              Create Review
            </Button>
          )
        }
      />

      {/* KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Total Appraisals Conducted"
            value={reviews.length}
            icon={<TrophyOutlined />}
            color="#0284c7"
            subtitle="Completed appraisal cycles"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Average Organization Rating"
            value={`${averageRating} / 5.0`}
            icon={<StarOutlined />}
            color="#f59e0b"
            subtitle="High performance threshold"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Strategic Goal Execution"
            value="88%"
            icon={<CheckCircleOutlined />}
            color="#10b981"
            subtitle="On-track KPI completion"
          />
        </Col>
      </Row>

      {/* Review Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'No performance reviews recorded' }}
        />
      </Card>

      {/* Create Review Modal */}
      <Modal
        title="Conduct Employee Performance Review"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={680}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReview}
          initialValues={{
            reviewPeriod: 'Q1 2026 Review',
            rating: 4,
            technicalSkills: 4,
            communication: 4,
            leadership: 4,
            punctuality: 5,
            workQuality: 4,
            goalProgress: 75,
          }}
          style={{ marginTop: 12 }}
        >
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="employeeId"
                label="Select Employee"
                rules={[{ required: true, message: 'Please select an employee' }]}
              >
                <Select placeholder="Choose employee">
                  {employees.map((e) => (
                    <Option key={e._id} value={e._id}>
                      {e.fullName} ({e.designation})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="reviewPeriod"
                label="Review Period"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g. Q1 2026" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="rating" label="Overall Rating (1 - 5 Stars)" rules={[{ required: true }]}>
            <Rate style={{ fontSize: 24 }} />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }}>Core Competencies & KPIs (1-5)</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="technicalSkills" label="Technical Skills / Domain Expertise">
                <Slider min={1} max={5} marks={{ 1: '1', 3: '3', 5: '5' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="communication" label="Communication & Collaboration">
                <Slider min={1} max={5} marks={{ 1: '1', 3: '3', 5: '5' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leadership" label="Leadership & Ownership">
                <Slider min={1} max={5} marks={{ 1: '1', 3: '3', 5: '5' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="workQuality" label="Quality of Deliverables">
                <Slider min={1} max={5} marks={{ 1: '1', 3: '3', 5: '5' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }}>Strategic Goals & KPI</Divider>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="goalTitle" label="Key Target Goal Title">
                <Input placeholder="e.g. Optimize response times by 30%" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="goalProgress" label="Current Progress %">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="strengths" label="Key Strengths & Achievements">
            <Input.TextArea rows={2} placeholder="Highlight major accomplishments..." />
          </Form.Item>

          <Form.Item name="areasForImprovement" label="Growth & Development Opportunities">
            <Input.TextArea rows={2} placeholder="Areas to focus on in next quarter..." />
          </Form.Item>

          <Form.Item name="feedback" label="Manager's Summary Feedback">
            <Input.TextArea rows={2} placeholder="Overall appraisal remarks..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Save Appraisal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Details View Modal */}
      <Modal
        title={`Appraisal Record: ${selectedReview?.employee?.fullName}`}
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedReview && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedReview.reviewPeriod}</Title>
                <Text type="secondary">Reviewer: {selectedReview.reviewer?.name || 'HR Manager'}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Rate disabled defaultValue={selectedReview.rating} />
                <div style={{ fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>
                  {selectedReview.rating} / 5.0
                </div>
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Key Strengths:</Text>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                {selectedReview.strengths || 'Consistent dedication to team goals and code quality.'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Areas for Improvement:</Text>
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                {selectedReview.areasForImprovement || 'Continue developing leadership and architectural documentation.'}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Manager's Executive Feedback:</Text>
              <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: 12, borderRadius: 8, fontSize: 13 }}>
                {selectedReview.feedback || 'Exceeds expectations across key enterprise deliverables.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PerformanceReviews;
