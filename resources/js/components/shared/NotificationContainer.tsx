import { useNotification } from '../../contexts/NotificationContext';
import Alert from './Alert';

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out"
        >
          <Alert
            type={notification.type}
            message={notification.message}
            dismissible={notification.dismissible}
            onDismiss={() => removeNotification(notification.id)}
            className="shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;
