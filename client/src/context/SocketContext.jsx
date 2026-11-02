import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { restaurant } = useAuth();

  useEffect(() => {
    // Socket connects to server on same host or port 5000 in dev
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (restaurant && restaurant._id) {
        socketInstance.emit('join_restaurant', restaurant._id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // When active restaurant changes, join restaurant room
  useEffect(() => {
    if (socket && isConnected && restaurant && restaurant._id) {
      socket.emit('join_restaurant', restaurant._id);
    }
  }, [socket, isConnected, restaurant]);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join_order', orderId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
