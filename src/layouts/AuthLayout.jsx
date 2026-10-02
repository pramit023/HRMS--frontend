import React from 'react';
import { Card, Typography } from 'antd';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const { Title, Text } = Typography;

const AuthLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: isDarkMode ? '#090d16' : '#f8fafc',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: isDarkMode ? '#2563eb' : '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 12,
            }}
          >
            N
          </div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Nexus HRMS
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Workforce & People Management
          </Text>
        </div>

        {/* Auth Container Card */}
        <Card
          bordered={true}
          style={{
            borderRadius: 8,
            borderColor: isDarkMode ? '#1f2937' : '#e2e8f0',
            background: isDarkMode ? '#111827' : '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Outlet />
        </Card>

        {/* Minimal Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
          &copy; {new Date().getFullYear()} Nexus HRMS Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
