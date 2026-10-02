import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleFinish = async (values) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(values.email, values.password);

      if (user?.mustChangePassword) {
        message.warning('First-time login: Please update your temporary password.');
        navigate('/change-password', { replace: true });
        return;
      }

      message.success(`Signed in as ${user.name}`);

      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'Super Admin') {
        navigate('/dashboard/super-admin', { replace: true });
      } else if (user.role === 'HR Manager' || user.role === 'HR Admin') {
        navigate('/dashboard/hr', { replace: true });
      } else {
        navigate('/dashboard/employee', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    form.setFieldsValue({ email, password });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
          Sign In
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter your credentials to access your account
        </Text>
      </div>

      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16, borderRadius: 6, fontSize: 12 }}
          onClose={() => setErrorMsg('')}
        />
      )}

      <Form
        form={form}
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<span style={{ fontSize: 13, fontWeight: 500 }}>Work Email</span>}
          rules={[
            { required: true, message: 'Work email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8', fontSize: 13 }} />}
            placeholder="name@company.com"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontSize: 13, fontWeight: 500 }}>Password</span>}
          rules={[{ required: true, message: 'Password is required' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: 13 }} />}
            placeholder="••••••••••••"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ fontSize: 12 }}>Remember me</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ fontSize: 12, color: '#2563eb' }}>
            Forgot password?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 16 }}>
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
            Sign In
          </Button>
        </Form.Item>
      </Form>

      {/* Discreet Demo Helper */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: 12,
          marginTop: 8,
          fontSize: 11,
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Quick Demo:</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span
            style={{ cursor: 'pointer', color: '#2563eb' }}
            onClick={() => fillCredentials('admin@enterprisehrms.com', 'Admin123!')}
          >
            Admin
          </span>
          <span>•</span>
          <span
            style={{ cursor: 'pointer', color: '#2563eb' }}
            onClick={() => fillCredentials('hrmanager@enterprisehrms.com', 'HR123!')}
          >
            HR
          </span>
          <span>•</span>
          <span
            style={{ cursor: 'pointer', color: '#2563eb' }}
            onClick={() => fillCredentials('alex.morgan@enterprisehrms.com', 'Emp123!')}
          >
            Employee
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
