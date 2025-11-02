import React, { useState, useEffect } from 'react';
import ConvAIIntegration from './components/ConvAIIntegration.js';
import MedicationManager from './components/MedicationManager.js';
import NotificationsPanel from './components/NotificationsPanel.js';
import EmergencySafety from './components/EmergencySafety.js';
import DailyLivingSupport from './components/DailyLivingSupport.js';
import awsMedicationAPI from './utils/awsMedicationAPI.js';
import './App.css';

function App() {
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('medications');
  const [apiStatus, setApiStatus] = useState('checking');

  // Load medications from AWS API on component mount
  useEffect(() => {
    const loadMedications = async () => {
      try {
        console.log('🔄 Loading medications from AWS API...');
        const result = await awsMedicationAPI.getMedications();
        
        if (result.status === 'success') {
          console.log(`✅ Loaded ${result.medications.length} medications from ${result.source || 'API'}`);
          setMedications(result.medications);
          setApiStatus('online');
          
          // Start notification checker
          awsMedicationAPI.startNotificationChecker(result.medications, (dueMeds) => {
            if (dueMeds.length > 0) {
              const newNotifications = dueMeds.map(med => ({
                id: Date.now() + Math.random(),
                medicationId: med.medication_id || med.id,
                message: `Time to take ${med.medication_name || med.name}${med.dosage ? ` (${med.dosage})` : ''}`,
                type: 'medication',
                time: new Date().toTimeString().slice(0, 5),
                timestamp: new Date().toISOString()
              }));
              
              setNotifications(prev => [...prev, ...newNotifications]);
              
              // Show browser notifications
              awsMedicationAPI.showBrowserNotifications(dueMeds);
            }
          });
        }
      } catch (error) {
        console.error('❌ Error loading medications:', error);
        setApiStatus('offline');
      }
    };

    loadMedications();
  }, []);

  const markAsTaken = async (medicationId) => {
    const medication = medications.find(med => 
      med.medication_id === medicationId || med.id === medicationId
    );
    
    if (medication) {
      try {
        // Log to AWS API
        await awsMedicationAPI.logMedicationAction({
          medication_name: medication.medication_name || medication.name,
          status: 'taken'
        });
      } catch (error) {
        console.error('Error logging to AWS:', error);
        // Continue anyway for better UX
      }
      
      // Update local state
      setMedications(prev => 
        prev.map(med => 
          (med.medication_id === medicationId || med.id === medicationId) 
            ? { ...med, taken: true, last_taken: new Date().toISOString() }
            : med
        )
      );
      
      // Remove related notifications
      setNotifications(prev => 
        prev.filter(notif => notif.medicationId !== medicationId)
      );
    }
  };

  const addMedication = async (newMed) => {
    try {
      console.log('🔄 Adding medication to AWS...', newMed);
      const result = await awsMedicationAPI.addMedication({
        medication_name: newMed.medication_name || newMed.name,
        dosage: newMed.dosage,
        times: newMed.times,
        phone_number: newMed.phone_number
      });
      
      if (result.status === 'success') {
        console.log('✅ Medication added successfully:', result.medication);
        setMedications(prev => [...prev, result.medication]);
        setApiStatus('online');
        return true;
      }
    } catch (error) {
      console.error('❌ Error adding medication:', error);
      setApiStatus('offline');
      
      // Add locally as fallback
      const localMedication = {
        ...newMed,
        id: `local_${Date.now()}`,
        medication_id: `local_${Date.now()}`,
        taken: false,
        source: 'local_cache',
        created_at: new Date().toISOString()
      };
      
      setMedications(prev => [...prev, localMedication]);
      return true;
    }
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
            <p>Your AWS-powered health companion</p>
            <div className={`api-status ${apiStatus}`}>
              AWS API: {apiStatus === 'online' ? '✅ Connected' : '❌ Offline - Using local storage'}
            </div>
          </div>
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
            className={`nav-btn ${activeTab === 'daily_living' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily_living')}
          >
            🌱 Daily Living
          </button>
          <button 
            className={`nav-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            🚨 Emergency & Safety
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
          
          {activeTab === 'daily_living' && (
            <div className="daily-living-tab">
              <DailyLivingSupport />
            </div>
          )}
          
          {activeTab === 'safety' && (
            <div className="safety-tab">
              <EmergencySafety />
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
                  <h3>AWS Status</h3>
                  <div className="stat-value">
                    {apiStatus === 'online' ? '✅' : '❌'}
                  </div>
                  <div className="stat-label">
                    {apiStatus === 'online' ? 'Connected' : 'Offline'}
                  </div>
                </div>
                <div className="stat-card">
                  <h3>Active Reminders</h3>
                  <div className="stat-value">{notifications.length}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                {medications.filter(m => m.last_taken).length === 0 ? (
                  <p className="no-activity">No recent medication activity</p>
                ) : (
                  <div className="activity-list">
                    {medications
                      .filter(m => m.last_taken)
                      .sort((a, b) => new Date(b.last_taken) - new Date(a.last_taken))
                      .slice(0, 5)
                      .map(med => (
                        <div key={med.medication_id || med.id} className="activity-item">
                          <span className="activity-med">{med.medication_name || med.name}</span>
                          <span className="activity-time">
                            Taken at {new Date(med.last_taken).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Medication Reminder App with AWS Lambda & ConvAI Integration | Stay Healthy! 💪</p>
      </footer>
    </div>
  );
}

export default App;
