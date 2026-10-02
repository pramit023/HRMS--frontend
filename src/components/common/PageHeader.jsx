import React from 'react';
import { Space } from 'antd';
import { useTheme } from '../../context/ThemeContext';

const PageHeader = ({ title, subtitle, extra }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: isDarkMode ? '#f8fafc' : '#0f172a',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: 13,
              color: isDarkMode ? '#94a3b8' : '#64748b',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {extra && <Space wrap size={10}>{extra}</Space>}
    </div>
  );
};

export default PageHeader;
