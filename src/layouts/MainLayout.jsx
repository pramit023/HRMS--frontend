import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useTheme } from '../context/ThemeContext';

const { Content, Footer } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      <Sidebar collapsed={collapsed} />
      <Layout style={{ background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          style={{
            padding: '24px 28px',
            minHeight: 'calc(100vh - 120px)',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Breadcrumbs />
          <Outlet />
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            fontSize: 12,
            padding: '14px 24px',
            borderTop: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Nexus Cloud • All Systems Operational</span>
          </div>

          <div>
            Nexus HRMS Enterprise Suite © {new Date().getFullYear()} • SOC-2 Type II Certified
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
