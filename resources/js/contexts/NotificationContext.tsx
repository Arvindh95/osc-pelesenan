import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Notification, NotificationContextType } from '../types';

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Notification provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        dismissible: notification.dismissible ?? true,
      };

      setNotifications(prev => [...prev, newNotification]);

      // Auto-dismiss after 5 seconds for success/info notifications
      if (
        newNotification.dismissible &&
        (newNotification.type === 'success' || newNotification.type === 'info')
      ) {
        setTimeout(() => {
          setNotifications(prev =>
            prev.filter(notification => notification.id !== id)
          );
        }, 5000);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
}
