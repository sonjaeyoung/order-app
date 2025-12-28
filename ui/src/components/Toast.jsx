import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-message">{message}</span>
      <button 
        className="toast-close" 
        onClick={onClose}
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;



