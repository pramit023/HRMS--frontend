import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useTheme } from '../context/ThemeContext';

const { Content, Footer } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#0b0f19' : '#f8fafc' }}>
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Layout style={{ background: isDarkMode ? '#0b0f19' : '#f8fafc', minWidth: 0, overflow: 'hidden' }}>
        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <Content
          className="main-content-layout"
          style={{
            minHeight: 'calc(100vh - 120px)',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div className="breadcrumb-wrapper">
            <Breadcrumbs />
          </div>
          <Outlet />
        </Content>
        <Footer
          className="main-footer-layout"
          style={{
            color: isDarkMode ? '#64748b' : '#94a3b8',
            borderTop: isDarkMode ? '1px solid #1f293d' : '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
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
