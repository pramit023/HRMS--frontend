import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message, Progress } from 'antd';
import { LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const { user, forceChangePassword, logout } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, status: 'normal', text: 'Enter password' };
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { score, status: 'exception', text: 'Weak' };
    if (score <= 75) return { score, status: 'active', text: 'Good' };
    return { score, status: 'success', text: 'Strong' };
  };

  const strength = calculateStrength(passwordValue);

  const handleSubmit = async (values) => {
    setLoading(true);
    setErrorMsg('');

    try {
      await forceChangePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      message.success('Password updated successfully');

      if (user?.role === 'Super Admin') {
        navigate('/dashboard/super-admin', { replace: true });
      } else if (user?.role === 'HR Manager' || user?.role === 'HR Admin') {
        navigate('/dashboard/hr', { replace: true });
      } else {
        navigate('/dashboard/employee', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
          Set New Password
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Please update your temporary password to secure your account.
        </Text>
      </div>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMsg('')}
          style={{ marginBottom: 16, borderRadius: 6, fontSize: 12 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label={<span style={{ fontSize: 13, fontWeight: 500 }}>Current (Temporary) Password</span>}
          rules={[{ required: true, message: 'Current password is required' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: 13 }} />}
            placeholder="Enter temporary password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={<span style={{ fontSize: 13, fontWeight: 500 }}>New Password</span>}
          rules={[
            { required: true, message: 'New password is required' },
            { min: 8, message: 'Must be at least 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: 13 }} />}
            placeholder="Minimum 8 characters"
            onChange={(e) => setPasswordValue(e.target.value)}
          />
        </Form.Item>

        {passwordValue && (
          <div style={{ marginBottom: 16, marginTop: -4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <Text type="secondary">Strength:</Text>
              <Text strong style={{ color: strength.status === 'success' ? '#16a34a' : strength.status === 'active' ? '#2563eb' : '#dc2626' }}>
                {strength.text}
              </Text>
            </div>
            <Progress
              percent={strength.score}
              status={strength.status}
              showInfo={false}
              strokeWidth={4}
            />
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontSize: 13, fontWeight: 500 }}>Confirm New Password</span>}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: 13 }} />}
            placeholder="Re-enter new password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 38,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Update Password & Continue
          </Button>
        </Form.Item>

        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => {
            logout();
            navigate('/login');
          }}
          block
          style={{ color: '#64748b', fontSize: 12 }}
        >
          Sign Out
        </Button>
      </Form>
    </div>
  );
};

export default ChangePassword;
