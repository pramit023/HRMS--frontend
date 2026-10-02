import React from 'react';
import { Layout, Menu, Typography, Avatar } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  DollarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
  CheckSquareOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Sider } = Layout;
const { Text } = Typography;

// Rich colorful icon mapping with vibrant jewel tones
const navIconConfig = {
  '/dashboard/super-admin': {
    icon: DashboardOutlined,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.14)',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  '/dashboard/hr': {
    icon: TeamOutlined,
    color: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.14)',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
  },
  '/dashboard/employee': {
    icon: UserOutlined,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.14)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
  },
  '/employees': {
    icon: TeamOutlined,
    color: '#0ea5e9',
    bg: 'rgba(14, 165, 233, 0.14)',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
  },
  '/departments': {
    icon: ApartmentOutlined,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.14)',
    gradient: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
  },
  '/attendance': {
    icon: CalendarOutlined,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  },
  '/leaves': {
    icon: ScheduleOutlined,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.14)',
    gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  },
  '/tasks': {
    icon: CheckSquareOutlined,
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.14)',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
  },
  '/documents': {
    icon: FolderOpenOutlined,
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.14)',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
  },
  '/payroll': {
    icon: DollarOutlined,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.14)',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
  },
  '/performance': {
    icon: TrophyOutlined,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.14)',
    gradient: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
  },
  '/reports': {
    icon: FileTextOutlined,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.14)',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  },
  '/audit': {
    icon: SafetyCertificateOutlined,
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.14)',
    gradient: 'linear-gradient(135deg, #ca8a04 0%, #fde047 100%)',
  },
  '/settings': {
    icon: SettingOutlined,
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.14)',
    gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
  },
};

const createNavItem = (key, label) => {
  const conf = navIconConfig[key] || {
    icon: DashboardOutlined,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.14)',
    gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
  };
  const IconComp = conf.icon;
  return {
    key,
    label: <span className="sidebar-item-label">{label}</span>,
    icon: (
      <span
        className="sidebar-colorful-icon"
        style={{
          '--badge-color': conf.color,
          '--badge-bg': conf.bg,
          '--badge-gradient': conf.gradient,
        }}
      >
        <IconComp />
      </span>
    ),
  };
};

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  // Role-based navigation items with colorful icons
  const getNavItems = () => {
    const role = user?.role;

    if (role === 'Super Admin') {
      return [
        {
          key: 'grp-dashboards',
          type: 'group',
          label: collapsed ? null : 'Executive Overview',
          children: [
            createNavItem('/dashboard/super-admin', 'Enterprise Dashboard'),
            createNavItem('/dashboard/hr', 'HR Operations'),
            createNavItem('/dashboard/employee', 'My Employee Portal'),
          ],
        },
        {
          key: 'grp-workforce',
          type: 'group',
          label: collapsed ? null : 'Workforce & People',
          children: [
            createNavItem('/employees', 'Employee Directory'),
            createNavItem('/departments', 'Departments'),
            createNavItem('/attendance', 'Time & Attendance'),
            createNavItem('/leaves', 'Leaves & Time Off'),
            createNavItem('/tasks', 'Task Center'),
            createNavItem('/documents', 'Document Vault'),
          ],
        },
        {
          key: 'grp-management',
          type: 'group',
          label: collapsed ? null : 'Finance & Governance',
          children: [
            createNavItem('/payroll', 'Payroll Management'),
            createNavItem('/performance', 'Performance & KPIs'),
            createNavItem('/reports', 'Analytics & Reports'),
            createNavItem('/audit', 'Security & Audit Logs'),
            createNavItem('/settings', 'System Settings'),
          ],
        },
      ];
    }

    if (role === 'HR Manager' || role === 'HR Admin' || role === 'Manager') {
      return [
        {
          key: 'grp-dashboards',
          type: 'group',
          label: collapsed ? null : 'Overview',
          children: [
            createNavItem('/dashboard/hr', 'HR Dashboard'),
            createNavItem('/dashboard/employee', 'My Portal'),
          ],
        },
        {
          key: 'grp-people',
          type: 'group',
          label: collapsed ? null : 'People & Operations',
          children: [
            createNavItem('/employees', 'Employee Directory'),
            createNavItem('/departments', 'Departments'),
            createNavItem('/attendance', 'Attendance Records'),
            createNavItem('/leaves', 'Leave Requests'),
            createNavItem('/tasks', 'Tasks'),
            createNavItem('/documents', 'Documents'),
          ],
        },
        {
          key: 'grp-finance',
          type: 'group',
          label: collapsed ? null : 'Compensations & Reviews',
          children: [
            createNavItem('/payroll', 'Payroll & Salaries'),
            createNavItem('/performance', 'Performance Reviews'),
            createNavItem('/reports', 'Reports & Exports'),
            createNavItem('/settings', 'Preferences'),
          ],
        },
      ];
    }

    // Regular Employee
    return [
      {
        key: 'grp-employee',
        type: 'group',
        label: collapsed ? null : 'My Workspace',
        children: [
          createNavItem('/dashboard/employee', 'My Dashboard'),
          createNavItem('/attendance', 'My Attendance'),
          createNavItem('/leaves', 'My Leaves & WFH'),
          createNavItem('/tasks', 'Assigned Tasks'),
          createNavItem('/documents', 'My Documents'),
          createNavItem('/payroll', 'My Payslips'),
          createNavItem('/performance', 'My Reviews & Goals'),
          createNavItem('/employees', 'Team Directory'),
          createNavItem('/settings', 'Account Settings'),
        ],
      },
    ];
  };

  const navItems = getNavItems();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={74}
      className="enterprise-sidebar"
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <div
        className="sidebar-brand-box"
        onClick={() => {
          if (user?.role === 'Super Admin') navigate('/dashboard/super-admin');
          else if (user?.role === 'HR Manager' || user?.role === 'HR Admin') navigate('/dashboard/hr');
          else navigate('/dashboard/employee');
        }}
      >
        <div className="sidebar-brand-icon">
          <span>N</span>
        </div>

        {!collapsed && (
          <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)',
                  display: 'block',
                }}
              >
                Nexus HRMS
              </span>
              <span className="brand-badge-pro">
                <ThunderboltFilled style={{ fontSize: 9, marginRight: 2 }} />
                PRO
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                display: 'block',
                fontWeight: 500,
              }}
            >
              Enterprise Workforce
            </span>
          </div>
        )}
      </div>

      {/* Navigation menu */}
      <div
        className="sidebar-menu-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Menu
          theme={isDarkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={navItems}
          onClick={handleMenuClick}
        />
      </div>

      {/* User Footer Summary */}
      {!collapsed && (
        <div style={{ padding: '0 10px 12px 10px' }}>
          <div
            className="sidebar-user-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => navigate('/settings')}
            >
              <div style={{ position: 'relative' }}>
                <Avatar
                  size={34}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid var(--bg-surface)',
                  }}
                />
              </div>
              <div style={{ overflow: 'hidden', lineHeight: 1.25 }}>
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.name || 'User'}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.role}
                </Text>
              </div>
            </div>

            <LogoutOutlined
              className="sidebar-logout-btn"
              title="Sign Out"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            />
          </div>
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
