import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Avatar,
  Card,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import {
  UserAddOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { employeeApi, departmentApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import EmployeeModal from './EmployeeModal';

const { Option } = Select;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { isSuperAdmin, isHR } = useAuth();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getAll({
        page,
        limit,
        search,
        department: selectedDept,
        status: selectedStatus,
      });

      if (res?.data) {
        setEmployees(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, selectedDept, selectedStatus]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getAll();
        if (res?.data) {
          setDepartments(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepts();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    try {
      await employeeApi.delete(id);
      message.success('Employee deleted successfully');
      fetchEmployees();
    } catch (err) {
      message.error(err.message || 'Failed to delete employee');
    }
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <Space size={10}>
          <Avatar
            src={record.profilePhoto}
            icon={<UserOutlined />}
            size={36}
            style={{ backgroundColor: '#2563eb' }}
          />
          <div>
            <span
              style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer', fontSize: 13 }}
              onClick={() => navigate(`/employees/${record._id}`)}
            >
              {record.fullName}
            </span>
            <div style={{ fontSize: 11, color: '#64748b' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (id) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 11,
            color: '#475569',
            padding: '2px 6px',
            background: '#f1f5f9',
            borderRadius: 4,
          }}
        >
          {id}
        </span>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept?.name || 'General',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Salary (Annual)',
      dataIndex: 'salary',
      key: 'salary',
      render: (sal) => (isSuperAdmin || isHR ? `$${(sal || 0).toLocaleString()}` : '••••••••'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const cls =
          status === 'Active'
            ? 'badge-active'
            : status === 'On Leave'
            ? 'badge-pending'
            : 'badge-inactive';
        return <span className={`status-pill ${cls}`}>{status}</span>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Profile">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#64748b' }} />}
              onClick={() => navigate(`/employees/${record._id}`)}
            />
          </Tooltip>

          {(isSuperAdmin || isHR) && (
            <Tooltip title="Edit Employee">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: '#2563eb' }} />}
                onClick={() => {
                  setEditingEmployee(record);
                  setModalOpen(true);
                }}
              />
            </Tooltip>
          )}

          {(isSuperAdmin || isHR) && (
            <Tooltip title="Delete Employee">
              <Popconfirm
                title="Delete Employee"
                description={`Permanently delete ${record.fullName}? This will also remove their login account.`}
                onConfirm={() => handleDelete(record._id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <PageHeader
        title="Employee Directory"
        subtitle="Manage organization profiles, contact info, departmental assignments, and compensations"
        extra={[
          (isSuperAdmin || isHR) && (
            <Button
              key="export"
              type="default"
              icon={<DownloadOutlined />}
              href="/api/reports/employee?format=excel"
              target="_blank"
            >
              Export Excel
            </Button>
          ),
          (isSuperAdmin || isHR) && (
            <Button
              key="add"
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                setEditingEmployee(null);
                setModalOpen(true);
              }}
            >
              Add Employee
            </Button>
          ),
        ]}
      />

      {/* Clean Filters Bar */}
      <Card className="glass-card" bodyStyle={{ padding: 14 }}>
        <div className="filter-bar-responsive">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            style={{ minWidth: 200, flex: '1 1 200px' }}
          />

          <Select
            placeholder="All Departments"
            value={selectedDept || undefined}
            onChange={(val) => {
              setSelectedDept(val);
              setPage(1);
            }}
            allowClear
            style={{ minWidth: 160, flex: '1 1 160px' }}
          >
            {departments.map((d) => (
              <Option key={d._id} value={d._id}>
                {d.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="All Statuses"
            value={selectedStatus || undefined}
            onChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
            allowClear
            style={{ minWidth: 130, flex: '1 1 130px' }}
          >
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
            <Option value="On Leave">On Leave</Option>
          </Select>

          <Button type="primary" ghost onClick={handleSearch} style={{ minWidth: 80 }}>
            Filter
          </Button>
        </div>
      </Card>

      {/* Employees Table */}
      <Card className="glass-card">
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
          locale={{ emptyText: 'No employees match your search query' }}
        />
      </Card>

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmployee}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};

export default EmployeeList;
