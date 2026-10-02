import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Avatar,
  Tag,
  Tabs,
  Space,
  message,
  Descriptions,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/endpoints';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;

const ProfileSettings = () => {
  const { user, refreshProfile } = useAuth();
  const [passwordForm] = Form.useForm();
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleChangePassword = async (values) => {
    setSubmittingPassword(true);
    try {
      await authApi.updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password updated successfully');
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to update password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const tabs = [
    {
      key: '1',
      label: 'Personal Overview',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Full Name">{user?.name}</Descriptions.Item>
          <Descriptions.Item label="Work Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Assigned Role">
            <span className={user?.role === 'Super Admin' ? 'badge-purple' : user?.role === 'HR Manager' ? 'badge-approved' : 'badge-active'}>
              {user?.role}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Account Status">
            <span className="badge-active">Active</span>
          </Descriptions.Item>
          <Descriptions.Item label="Employee ID">
            <span className="badge-id">{user?.employeeProfile?.employeeId || 'N/A'}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Designation">
            {user?.employeeProfile?.designation || 'Administrator'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Login" span={2}>
            {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: 'Security & Change Password',
      children: (
        <div style={{ maxWidth: 500 }}>
          <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••••••" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Must be at least 6 characters' },
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••••••" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••••••" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submittingPassword}
              style={{ borderRadius: 8, height: 40 }}
            >
              Update Password
            </Button>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="User Profile & Security Preferences"
        subtitle="Manage your personal credentials, contact details, and account security"
      />

      {/* User Card */}
      <Card className="glass-card">
        <Space size={20} align="center">
          <Avatar
            size={72}
            src={user?.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#0284c7' }}
          />
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {user?.name}
            </h2>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 8 }}>
              <span className={user?.role === 'Super Admin' ? 'badge-purple' : user?.role === 'HR Manager' ? 'badge-approved' : 'badge-active'}>
                {user?.role}
              </span>
            </div>
          </div>
        </Space>
      </Card>

      {/* Settings Tabs */}
      <Card className="glass-card">
        <Tabs items={tabs} defaultActiveKey="1" />
      </Card>
    </div>
  );
};

export default ProfileSettings;
