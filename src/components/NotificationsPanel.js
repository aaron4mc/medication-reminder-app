import React from 'react';

const NotificationsPanel = ({ 
  notifications, 
  onMarkAsTaken, 
  onRemoveNotification, 
  onClearAll,
  medications 
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <div className="notifications-title">
          <span className="notification-bell">🔔</span>
          <h3>Medication Reminders</h3>
          <span className="notification-count">{notifications.length}</span>
        </div>
        <button 
          className="clear-all-btn"
          onClick={onClearAll}
        >
          Clear All
        </button>
      </div>
      
      <div className="notifications-list">
        {notifications.map(notification => {
          const medication = medications.find(m => m.id === notification.medicationId);
          return (
            <div key={notification.id} className="notification-item">
              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="notification-actions">
                {medication && !medication.taken && (
                  <button 
                    className="action-btn primary"
                    onClick={() => onMarkAsTaken(notification.medicationId)}
                  >
                    Mark Taken
                  </button>
                )}
                <button 
                  className="action-btn secondary"
                  onClick={() => onRemoveNotification(notification.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPanel;
