import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/endpoints';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, { password: values.password });
      message.success('Password successfully reset! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      message.error(err.message || 'Invalid or expired password reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          Create new password
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter a secure password of at least 6 characters
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleFinish} size="large">
        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600 }}>New Password</span>}
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 6, message: 'Password must be at least 6 characters!' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="••••••••••••"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span style={{ fontWeight: 600 }}>Confirm New Password</span>}
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="••••••••••••"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          style={{ borderRadius: 8, height: 44, fontWeight: 600, marginTop: 8 }}
        >
          Update Password & Sign In
        </Button>
      </Form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: 13, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeftOutlined /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
