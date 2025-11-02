import React, { useState, useEffect } from 'react';
import ConvAIIntegration from './components/ConvAIIntegration.js';
import MedicationManager from './components/MedicationManager.js';
import NotificationsPanel from './components/NotificationsPanel.js';
import './App.css';

function App() {
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('medications');

  // Load medications from localStorage on component mount
  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    } else {
      // Sample medications if none exist
      const sampleMeds = [
        { 
          id: 1, 
          name: 'Aspirin', 
          dosage: '100mg', 
          times: ['08:00', '20:00'], 
          taken: false,
          type: 'pill'
        },
        { 
          id: 2, 
          name: 'Vitamin D', 
          dosage: '1000IU', 
          times: ['12:00'], 
          taken: false,
          type: 'supplement'
        }
      ];
      setMedications(sampleMeds);
      localStorage.setItem('medications', JSON.stringify(sampleMeds));
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  // Check for medication reminders
  useEffect(() => {
    const checkMedicationTimes = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

      medications.forEach(med => {
        if (med.times.includes(currentTime) && !med.taken) {
          // Check if notification already exists
          const existingNotification = notifications.find(
            n => n.medicationId === med.id && n.time === currentTime
          );
          
          if (!existingNotification) {
            const newNotification = {
              id: Date.now() + Math.random(),
              medicationId: med.id,
              message: `Time to take ${med.name} (${med.dosage})`,
              type: 'medication',
              time: currentTime,
              timestamp: new Date().toISOString()
            };
            
            setNotifications(prev => [...prev, newNotification]);
            
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('💊 Medication Reminder', {
                body: newNotification.message,
                icon: '/favicon.ico',
                tag: `med-reminder-${med.id}-${currentTime}`
              });
            }
          }
        }
      });
    };

    // Check immediately
    checkMedicationTimes();
    
    // Set up interval to check every minute
    const interval = setInterval(checkMedicationTimes, 60000);
    return () => clearInterval(interval);
  }, [medications, notifications]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  };

  const markAsTaken = (medicationId) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === medicationId ? { ...med, taken: true } : med
      )
    );
    
    // Remove related notifications
    setNotifications(prev => 
      prev.filter(notif => notif.medicationId !== medicationId)
    );
  };

  const addMedication = (newMed) => {
    const medication = {
      ...newMed,
      id: Date.now(),
      taken: false
    };
    setMedications(prev => [...prev, medication]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>💊 Medication Reminder</h1>
            <p>Your AI-powered health companion</p>
          </div>
          <button 
            className="notification-permission-btn"
            onClick={requestNotificationPermission}
          >
            🔔 Enable Notifications
          </button>
        </div>
        
        <nav className="app-nav">
          <button 
            className={`nav-btn ${activeTab === 'medications' ? 'active' : ''}`}
            onClick={() => setActiveTab('medications')}
          >
            💊 Medications
          </button>
          <button 
            className={`nav-btn ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
          >
            🤖 AI Assistant
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 History
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {/* Notifications Panel */}
        <NotificationsPanel 
          notifications={notifications}
          onMarkAsTaken={markAsTaken}
          onRemoveNotification={removeNotification}
          onClearAll={clearAllNotifications}
          medications={medications}
        />

        {/* Main Content based on active tab */}
        <div className="tab-content">
          {activeTab === 'medications' && (
            <MedicationManager 
              medications={medications}
              onMarkAsTaken={markAsTaken}
              onAddMedication={addMedication}
            />
          )}
          
          {activeTab === 'assistant' && (
            <div className="assistant-tab">
              <ConvAIIntegration />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="history-tab">
              <h2>Medication History</h2>
              <div className="history-stats">
                <div className="stat-card">
                  <h3>Today's Progress</h3>
                  <div className="stat-value">
                    {medications.filter(m => m.taken).length} / {medications.length}
                  </div>
                  <div className="stat-label">Medications Taken</div>
                </div>
                <div className="stat-card">
                  <h3>Active Reminders</h3>
                  <div className="stat-value">{notifications.length}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Medication Reminder App with ConvAI Integration | Stay Healthy! 💪</p>
      </footer>
    </div>
  );
}

export default App;
