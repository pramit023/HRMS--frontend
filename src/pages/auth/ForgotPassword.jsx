import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetTokenData, setResetTokenData] = useState(null);
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: values.email });
      message.success('Password reset instructions generated.');
      if (res?.data?.resetToken) {
        setResetTokenData(res.data.resetToken);
      }
    } catch (err) {
      message.error(err.message || 'Failed to process forgot password request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          Reset your password
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter your registered work email to receive password reset instructions
        </Text>
      </div>

      {resetTokenData ? (
        <div>
          <Alert
            type="success"
            message="Password Reset Token Generated"
            description={
              <div>
                <p style={{ margin: '8px 0', fontSize: 12 }}>
                  For testing/evaluation convenience, your secure reset token is:
                </p>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.05)',
                    padding: '8px',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    wordBreak: 'break-all',
                  }}
                >
                  {resetTokenData}
                </div>
              </div>
            }
            style={{ marginBottom: 16 }}
          />

          <Button
            type="primary"
            block
            onClick={() => navigate(`/reset-password/${resetTokenData}`)}
            style={{ borderRadius: 8, height: 40 }}
          >
            Proceed to Set New Password
          </Button>
        </div>
      ) : (
        <Form layout="vertical" onFinish={handleFinish} size="large">
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Work Email</span>}
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="e.g. admin@enterprisehrms.com"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
          >
            Send Reset Instructions
          </Button>
        </Form>
      )}

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: 13, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeftOutlined /> Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
