import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Slider,
  Space,
  Typography,
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { taskApi, employeeApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TasksView = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [createForm] = Form.useForm();
  const [progressForm] = Form.useForm();

  const isPrivileged = ['Super Admin', 'HR Manager', 'HR Admin', 'Manager'].includes(user?.role);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await taskApi.getAll(params);
      if (res?.data) {
        setTasks(res.data);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (isPrivileged) {
      try {
        const res = await employeeApi.getAll({ limit: 100 });
        if (res?.data) {
          setEmployees(res.data);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const handleCreateTask = async (values) => {
    try {
      await taskApi.create({
        title: values.title,
        description: values.description,
        assignedTo: values.assignedTo,
        dueDate: values.dueDate.toISOString(),
        priority: values.priority,
      });
      message.success('Task created and assigned successfully!');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateProgress = async (values) => {
    if (!selectedTask) return;
    try {
      await taskApi.updateProgress(selectedTask._id, {
        progress: values.progress,
        status: values.progress === 100 ? 'Completed' : values.status,
      });
      message.success('Task progress updated successfully!');
      setProgressModalOpen(false);
      fetchTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await taskApi.updateProgress(taskId, {
        progress: 100,
        status: 'Completed',
      });
      message.success('Task marked as completed!');
      fetchTasks();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update task');
    }
  };

  const openProgressModal = (task) => {
    setSelectedTask(task);
    progressForm.setFieldsValue({
      progress: task.progress || 0,
      status: task.status,
    });
    setProgressModalOpen(true);
  };

  const getPriorityTag = (priority) => {
    const map = {
      Low: 'default',
      Medium: 'blue',
      High: 'orange',
      Urgent: 'red',
    };
    return <Tag color={map[priority] || 'blue'}>{priority}</Tag>;
  };

  const getStatusTag = (status) => {
    const map = {
      Pending: { color: 'gold', icon: <ClockCircleOutlined /> },
      'In Progress': { color: 'processing', icon: <SyncOutlined spin /> },
      Completed: { color: 'success', icon: <CheckCircleOutlined /> },
      Cancelled: { color: 'default', icon: <ExclamationCircleOutlined /> },
    };
    const cfg = map[status] || { color: 'default' };
    return (
      <Tag color={cfg.color} icon={cfg.icon}>
        {status}
      </Tag>
    );
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  const columns = [
    {
      title: 'Task Title & Description',
      key: 'title',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {record.title}
          </Text>
          {record.description && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    ...(isPrivileged
      ? [
          {
            title: 'Assigned To',
            key: 'assignedTo',
            render: (_, record) => (
              <span>
                {record.assignedTo?.fullName || 'Unassigned'} ({record.assignedTo?.employeeId})
              </span>
            ),
          },
        ]
      : []),
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate) => {
        const isPast = dayjs().isAfter(dayjs(dueDate), 'day');
        return (
          <span style={{ color: isPast ? '#ef4444' : 'inherit' }}>
            {dayjs(dueDate).format('MMM DD, YYYY')}
            {isPast && <Tag color="error" style={{ marginLeft: 6, fontSize: 10 }}>Overdue</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <div style={{ width: 140 }}>
          <Progress
            percent={record.progress || 0}
            size="small"
            status={record.status === 'Completed' ? 'success' : 'active'}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            onClick={() => openProgressModal(record)}
          >
            Update
          </Button>
          {record.status !== 'Completed' && (
            <Button
              size="small"
              type="text"
              icon={<CheckCircleOutlined style={{ color: '#16a34a' }} />}
              onClick={() => handleMarkComplete(record._id)}
            >
              Complete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {isPrivileged ? 'Task Operations & Delegations' : 'My Assigned Tasks'}
          </Title>
          <Text type="secondary">
            {isPrivileged
              ? 'Delegate assignments and monitor team milestones in real-time.'
              : 'Track and update progress on your assigned deliverables.'}
          </Text>
        </div>
        {isPrivileged && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ borderRadius: 6 }}
          >
            Assign New Task
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Total Tasks" value={totalTasks} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="In Progress"
              value={inProgressTasks}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Pending"
              value={pendingTasks}
              valueStyle={{ color: '#d97706' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Completed"
              value={completedTasks}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search tasks by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchTasks}
              allowClear
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Status"
              allowClear
              value={statusFilter || undefined}
              onChange={(val) => setStatusFilter(val || '')}
            >
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={12} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Priority"
              allowClear
              value={priorityFilter || undefined}
              onChange={(val) => setPriorityFilter(val || '')}
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Urgent">Urgent</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button onClick={fetchTasks} block>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tasks Table */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Create Task Modal */}
      <Modal
        title="Assign New Task"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="e.g. Q3 Compliance Review" />
          </Form.Item>

          <Form.Item name="description" label="Detailed Description">
            <Input.TextArea rows={3} placeholder="Describe deliverable and instructions..." />
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="Assign To Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              placeholder="Select employee"
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map((emp) => (
                <Option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.employeeId} - {emp.designation})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Please select due date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" initialValue="Medium">
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Assign Task
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        title={`Update Task: ${selectedTask?.title || ''}`}
        open={progressModalOpen}
        onCancel={() => setProgressModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={progressForm} layout="vertical" onFinish={handleUpdateProgress}>
          <Form.Item name="progress" label="Completion Percentage (%)">
            <Slider marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="Current Status">
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setProgressModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Save Progress
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksView;
