import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const breadcrumbNameMap = {
  '/dashboard': 'Dashboard',
  '/dashboard/super-admin': 'Super Admin',
  '/dashboard/hr': 'HR Operations',
  '/dashboard/employee': 'Self Service',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/leaves': 'Leave Management',
  '/payroll': 'Payroll & Salary',
  '/performance': 'Performance',
  '/reports': 'Reports & Analytics',
  '/audit': 'Security & Audit',
  '/settings': 'Settings',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSnippets.length - 1;
    const name = breadcrumbNameMap[url] || pathSnippets[index];

    return {
      title: isLast ? (
        <span style={{ fontWeight: 600, color: 'inherit' }}>{name}</span>
      ) : (
        <Link to={url}>{name}</Link>
      ),
    };
  });

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined style={{ marginRight: 4 }} />
          Home
        </Link>
      ),
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default Breadcrumbs;
