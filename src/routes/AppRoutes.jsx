import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Auth pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';

// Dashboards
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard';
import HRDashboard from '../pages/dashboard/HRDashboard';
import EmployeeDashboard from '../pages/dashboard/EmployeeDashboard';

// Modules
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeDetails from '../pages/employees/EmployeeDetails';
import DepartmentList from '../pages/departments/DepartmentList';
import AttendanceView from '../pages/attendance/AttendanceView';
import LeaveManagement from '../pages/leaves/LeaveManagement';
import PayrollManagement from '../pages/payroll/PayrollManagement';
import PerformanceReviews from '../pages/performance/PerformanceReviews';
import TasksView from '../pages/tasks/TasksView';
import DocumentsView from '../pages/documents/DocumentsView';
import ReportsHub from '../pages/reports/ReportsHub';
import AuditLogs from '../pages/audit/AuditLogs';
import ProfileSettings from '../pages/settings/ProfileSettings';
import NotFound from '../pages/NotFound';

// Root redirect based on role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
  if (user.role === 'Super Admin') return <Navigate to="/dashboard/super-admin" replace />;
  if (user.role === 'HR Manager' || user.role === 'HR Admin') return <Navigate to="/dashboard/hr" replace />;
  return <Navigate to="/dashboard/employee" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected Enterprise Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* Dashboards */}
        <Route
          path="dashboard/super-admin"
          element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/hr"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'HR Manager', 'HR Admin']}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="dashboard/employee" element={<EmployeeDashboard />} />

        {/* Core Modules */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="attendance" element={<AttendanceView />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="payroll" element={<PayrollManagement />} />
        <Route path="tasks" element={<TasksView />} />
        <Route path="documents" element={<DocumentsView />} />
        <Route path="performance" element={<PerformanceReviews />} />

        {/* Reports & Audit */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'HR Manager', 'HR Admin']}>
              <ReportsHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* Profile Settings */}
        <Route path="settings" element={<ProfileSettings />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
