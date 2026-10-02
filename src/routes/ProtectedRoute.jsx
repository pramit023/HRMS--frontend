import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#64748b' }}>Authenticating session...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force first-time password change before granting access to application
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Prevent accessing change-password screen if already completed
  if (!user.mustChangePassword && location.pathname === '/change-password') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRoles = [...allowedRoles];
    if (effectiveRoles.includes('HR Manager') && !effectiveRoles.includes('HR Admin')) {
      effectiveRoles.push('HR Admin');
    }
    if (effectiveRoles.includes('HR Admin') && !effectiveRoles.includes('HR Manager')) {
      effectiveRoles.push('HR Manager');
    }

    if (!effectiveRoles.includes(user.role)) {
      // Role not authorized - redirect to role's home dashboard
      if (user.role === 'Super Admin') return <Navigate to="/dashboard/super-admin" replace />;
      if (user.role === 'HR Manager' || user.role === 'HR Admin') return <Navigate to="/dashboard/hr" replace />;
      return <Navigate to="/dashboard/employee" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
