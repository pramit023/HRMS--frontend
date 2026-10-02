import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('hrms_theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('hrms_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const themeTokens = {
    token: {
      colorPrimary: '#2563eb',
      colorInfo: '#2563eb',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      borderRadius: 6,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      colorBgBase: isDarkMode ? '#090d16' : '#ffffff',
      colorBgContainer: isDarkMode ? '#111827' : '#ffffff',
      colorBgElevated: isDarkMode ? '#1f2937' : '#ffffff',
      colorBorder: isDarkMode ? '#1f2937' : '#e2e8f0',
      colorBorderSecondary: isDarkMode ? '#1f2937' : '#f1f5f9',
      colorText: isDarkMode ? '#f8fafc' : '#0f172a',
      colorTextSecondary: isDarkMode ? '#94a3b8' : '#64748b',
      wireframe: false,
    },
    components: {
      Layout: {
        bodyBg: isDarkMode ? '#090d16' : '#f8fafc',
        headerBg: isDarkMode ? '#111827' : '#ffffff',
        siderBg: isDarkMode ? '#111827' : '#ffffff',
      },
      Card: {
        borderRadiusLG: 8,
        headerHeight: 44,
        headerFontSize: 13,
        colorBorderSecondary: isDarkMode ? '#1f2937' : '#e2e8f0',
        paddingLG: 18,
      },
      Table: {
        headerBg: isDarkMode ? '#1f2937' : '#f8fafc',
        headerColor: isDarkMode ? '#94a3b8' : '#64748b',
        headerSplitColor: 'transparent',
        rowHoverBg: isDarkMode ? '#1f2937' : '#f8fafc',
        borderColor: isDarkMode ? '#1f2937' : '#e2e8f0',
        borderRadius: 6,
      },
      Button: {
        controlHeight: 36,
        borderRadius: 6,
        fontWeight: 500,
        boxShadow: 'none',
        defaultBorderColor: isDarkMode ? '#374151' : '#e2e8f0',
      },
      Input: {
        controlHeight: 36,
        borderRadius: 6,
        colorBorder: isDarkMode ? '#374151' : '#e2e8f0',
      },
      Select: {
        controlHeight: 36,
        borderRadius: 6,
      },
      DatePicker: {
        controlHeight: 36,
        borderRadius: 6,
      },
      Menu: {
        itemBorderRadius: 6,
        itemMarginInline: 6,
        itemHeight: 36,
        subMenuItemBg: 'transparent',
      },
      Modal: {
        borderRadiusLG: 10,
      },
      Tabs: {
        titleFontSize: 13,
      },
    },
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeTokens}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
