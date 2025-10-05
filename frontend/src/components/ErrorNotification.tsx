import React, { useEffect } from 'react';
import './ErrorNotification.css';

interface ErrorNotificationProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  message, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="error-notification" role="alert" aria-live="assertive">
      <div className="error-notification-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{message}</span>
        <button 
          className="error-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;
