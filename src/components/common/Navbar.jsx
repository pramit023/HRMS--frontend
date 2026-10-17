import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Popover,
  List,
  Space,
  Typography,
  message,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  SearchOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { notificationApi, attendanceApi } from '../../api/endpoints';
import GlobalSearchModal from './GlobalSearchModal';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({
  collapsed,
  setCollapsed,
  isMobile = false,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { latestNotification } = useSocket();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await attendanceApi.getToday();
      if (res?.data) {
        setTodayAttendance(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchAttendanceStatus();
  }, [latestNotification]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      message.success('Notifications marked as read');
    } catch (e) {
      message.error('Failed to mark notifications');
    }
  };

  const handleCheckIn = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkIn({});
      message.success('Checked in successfully');
      fetchAttendanceStatus();
    } catch (err) {
      message.error(err.message || 'Check-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setClockLoading(true);
    try {
      await attendanceApi.checkOut();
      message.success('Checked out successfully');
      fetchAttendanceStatus();
    } catch (err) {
      message.error(err.message || 'Check-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const notificationContent = (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 4px 10px 4px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <Text strong style={{ fontSize: 13 }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllRead}
            style={{ fontSize: 11, padding: 0 }}
          >
            Mark all read
          </Button>
        )}
      </div>

      <List
        size="small"
        dataSource={notifications}
        locale={{ emptyText: <span style={{ color: '#94a3b8', fontSize: 12 }}>No new notifications</span> }}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '8px 4px',
              borderBottom: '1px solid var(--border-subtle)',
              cursor: item.link ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (item.link) navigate(item.link);
            }}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 12 }}>
                    {item.title}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
              }
              description={<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.message}</span>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 2px' }}>
          <Text strong style={{ display: 'block', fontSize: 13 }}>{user?.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{user?.email}</Text>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Account Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign Out',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleToggleClick = () => {
    if (isMobile) {
      if (setMobileOpen) setMobileOpen(!mobileOpen);
    } else {
      if (setCollapsed) setCollapsed(!collapsed);
    }
  };

  return (
    <Header className="enterprise-navbar">
      <Space size={10} align="center">
        <Button
          className="nav-icon-btn"
          type="text"
          icon={
            isMobile
              ? mobileOpen
                ? <MenuFoldOutlined />
                : <MenuOutlined />
              : collapsed
              ? <MenuUnfoldOutlined />
              : <MenuFoldOutlined />
          }
          onClick={handleToggleClick}
          aria-label="Toggle navigation"
        />

        {/* Mobile Brand Name & Icon */}
        {isMobile && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => {
              if (user?.role === 'Super Admin') navigate('/dashboard/super-admin');
              else if (user?.role === 'HR Manager' || user?.role === 'HR Admin') navigate('/dashboard/hr');
              else navigate('/dashboard/employee');
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            >
              N
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Nexus
            </span>
          </div>
        )}

        {/* Desktop Global Search Trigger Pill */}
        <Button
          type="default"
          className="nav-search-btn nav-search-desktop"
          icon={<SearchOutlined style={{ fontSize: 13 }} />}
          onClick={() => setSearchOpen(true)}
        >
          <span>Search modules...</span>
          <span className="nav-search-badge">⌘K</span>
        </Button>

        {/* Mobile Compact Search Trigger Icon Button */}
        <Button
          type="text"
          className="nav-icon-btn nav-search-mobile"
          icon={<SearchOutlined style={{ fontSize: 15 }} />}
          onClick={() => setSearchOpen(true)}
          title="Search modules"
        />
      </Space>

      <Space size={8} align="center">
        {/* Attendance Check-in Widget (if employee) */}
        {user?.employeeProfile && (
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            {!todayAttendance?.checkIn ? (
              <Button
                type="primary"
                size="small"
                icon={<ClockCircleOutlined />}
                loading={clockLoading}
                onClick={handleCheckIn}
                style={{ fontSize: 11, height: 28, padding: '0 10px', borderRadius: 6 }}
              >
                Clock In
              </Button>
            ) : !todayAttendance?.checkOut ? (
              <Button
                danger
                size="small"
                loading={clockLoading}
                onClick={handleCheckOut}
                style={{ fontSize: 11, height: 28, padding: '0 10px', borderRadius: 6 }}
              >
                Clock Out
              </Button>
            ) : (
              <span className="nav-shift-done-pill" style={{ padding: '2px 8px', fontSize: 11 }}>
                <CheckCircleOutlined style={{ color: '#10b981' }} />
                <span>Shift Done</span>
              </span>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          overlayClassName="mobile-responsive-popover"
        >
          <Badge count={unreadCount} size="small" offset={[-2, 4]}>
            <Button
              type="text"
              className="nav-icon-btn"
              icon={<BellOutlined style={{ fontSize: 16 }} />}
              aria-label="Notifications"
            />
          </Badge>
        </Popover>

        {/* Theme toggle */}
        <Button
          type="text"
          className="nav-icon-btn"
          icon={isDarkMode ? <SunOutlined style={{ fontSize: 15 }} /> : <MoonOutlined style={{ fontSize: 15 }} />}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        />

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="nav-user-pill">
            <Avatar
              size={28}
              style={{
                backgroundColor: isDarkMode ? '#2563eb' : '#0f172a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Avatar>
          </div>
        </Dropdown>
      </Space>

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </Header>
  );
};

export default Navbar;
