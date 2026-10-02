import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { notification } from 'antd';
import { useAuth } from './AuthContext';
import { BellOutlined } from '@ant-design/icons';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [latestNotification, setLatestNotification] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : window.location.origin);
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('join', {
        userId: user._id,
        role: user.role,
      });
    });

    newSocket.on('notification', (notif) => {
      setLatestNotification(notif);
      notification.info({
        message: notif.title || 'HRMS Notification',
        description: notif.message,
        icon: <BellOutlined style={{ color: '#0284c7' }} />,
        placement: 'topRight',
        duration: 5,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, latestNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
