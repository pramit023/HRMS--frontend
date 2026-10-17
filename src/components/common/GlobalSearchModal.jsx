import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Avatar, Tag, Typography, Empty, Spin, Button } from 'antd';
import { SearchOutlined, UserOutlined, ApartmentOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { employeeApi, departmentApi } from '../../api/endpoints';

const { Text } = Typography;

const GlobalSearchModal = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setEmployees([]);
      setDepartments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [empRes, deptRes] = await Promise.all([
          employeeApi.getAll({ search: query, limit: 5 }),
          departmentApi.getAll(),
        ]);

        if (empRes?.data) {
          setEmployees(empRes.data);
        }
        if (deptRes?.data) {
          const matchedDepts = deptRes.data.filter((d) =>
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.code.toLowerCase().includes(query.toLowerCase())
          );
          setDepartments(matchedDepts.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectEmployee = (id) => {
    navigate(`/employees/${id}`);
    onClose();
  };

  const handleSelectDepartment = (id) => {
    navigate(`/departments`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="min(560px, calc(100vw - 24px))"
      style={{ top: 24, margin: '0 auto' }}
      styles={{ body: { padding: '16px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#0284c7', fontSize: 16, marginRight: 6 }} />}
          placeholder="Search employees or departments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          size="middle"
          style={{
            borderRadius: 8,
            fontSize: 14,
            flex: 1,
          }}
        />
        <Button
          type="text"
          icon={<CloseOutlined style={{ fontSize: 15, color: '#94a3b8' }} />}
          onClick={onClose}
          aria-label="Close search"
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <Spin tip="Searching enterprise directory..." />
        </div>
      ) : query && employees.length === 0 && departments.length === 0 ? (
        <Empty description="No matching employees or departments found" style={{ padding: '20px 0' }} />
      ) : (
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {employees.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                Employees ({employees.length})
              </Text>
              <List
                dataSource={employees}
                renderItem={(emp) => (
                  <List.Item
                    onClick={() => handleSelectEmployee(emp._id)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 8,
                      transition: 'background 0.2s',
                    }}
                    className="search-item-hover"
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={emp.profilePhoto}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: '#0284c7' }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{emp.fullName}</span>
                          <Tag color="blue">{emp.employeeId}</Tag>
                        </div>
                      }
                      description={`${emp.designation} • ${emp.department?.name || 'General'}`}
                    />
                    <RightOutlined style={{ color: '#94a3b8' }} />
                  </List.Item>
                )}
              />
            </div>
          )}

          {departments.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                Departments ({departments.length})
              </Text>
              <List
                dataSource={departments}
                renderItem={(dept) => (
                  <List.Item
                    onClick={() => handleSelectDepartment(dept._id)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 8,
                      transition: 'background 0.2s',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<ApartmentOutlined />}
                          style={{ backgroundColor: '#6366f1' }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{dept.name}</span>
                          <Tag color="purple">{dept.code}</Tag>
                        </div>
                      }
                      description={`Budget: $${(dept.budget || 0).toLocaleString()} • Location: ${dept.location || 'HQ'}`}
                    />
                    <RightOutlined style={{ color: '#94a3b8' }} />
                  </List.Item>
                )}
              />
            </div>
          )}

          {!query && (
            <div style={{ padding: '16px 8px', color: '#64748b', fontSize: 13 }}>
              💡 Quick jump: Type any employee name, email, designation, or department code.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default GlobalSearchModal;
