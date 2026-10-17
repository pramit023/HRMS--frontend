import React from 'react';
import { Space } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const PageHeader = ({ title, subtitle, extra }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="page-header-container">
      <div className="page-header-text">
        <h1
          className="page-header-title"
          style={{
            color: isDarkMode ? '#f8fafc' : '#0f172a',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="page-header-subtitle"
            style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {extra && (
        <div className="page-header-extra">
          <Space wrap size={8}>
            {extra}
          </Space>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
