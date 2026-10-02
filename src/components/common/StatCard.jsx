import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  subtitle,
  loading = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Card
      loading={loading}
      className="stat-card"
      bodyStyle={{ padding: '16px 18px' }}
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>

          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>

          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            {trend && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 500,
                  color: trend === 'up' ? '#059669' : '#dc2626',
                  backgroundColor: trend === 'up'
                    ? (isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5')
                    : (isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'),
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                {trend === 'up' ? <ArrowUpOutlined style={{ fontSize: 9 }} /> : <ArrowDownOutlined style={{ fontSize: 9 }} />}
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
