import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

export const useSocket = (conversationId = null) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    // Connect socket
    const socket = io(import.meta.env.VITE_API_URL , {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (conversationId) {
        socket.emit('join_conversation', conversationId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Typing listeners
    socket.on('typing_start', (data) => {
      setTypingUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('typing_stop', (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      socket.disconnect();
    };
  }, [token, conversationId]);

  // Emit typing start
  const startTyping = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing_start', { conversationId });
    }
  }, [conversationId]);

  // Emit typing stop
  const stopTyping = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing_stop', { conversationId });
    }
  }, [conversationId]);

  return {
    socket: socketRef.current,
    isConnected,
    typingUsers,
    startTyping,
    stopTyping,
  };
};
