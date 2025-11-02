import React, { useState, useEffect } from 'react';
import awsMedicationAPI from '../utils/awsMedicationAPI.js';

const MedicationManager = ({ medications, onMarkAsTaken, onAddMedication, onNotifications }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    times: '',
    type: 'pill',
    phone_number: '+85259192611',
    timezone: 'Asia/Shanghai'
  });
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [addingTestData, setAddingTestData] = useState(false);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    const status = await awsMedicationAPI.getAPIStatus();
    setApiStatus(status.online ? 'online' : 'offline');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMed.name && newMed.times) {
      setLoading(true);
      
      try {
        const result = await awsMedicationAPI.addMedication({
          medication_name: newMed.name,
          dosage: newMed.dosage,
          times: newMed.times.split(',').map(time => time.trim()),
          phone_number: newMed.phone_number,
          timezone: newMed.timezone
        });
        
        if (result.status === 'success') {
          // Notify parent component
          if (onAddMedication) {
            onAddMedication(result.medication);
          }
          
          setNewMed({ 
            name: '', 
            dosage: '', 
            times: '', 
            type: 'pill', 
            phone_number: '+85259192611',
            timezone: 'Asia/Shanghai'
          });
          setShowAddForm(false);
          checkAPIStatus(); // Refresh API status
        }
      } catch (error) {
        console.error('Error adding medication:', error);
        alert('Failed to add medication. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsTaken = async (medicationId) => {
    const medication = medications.find(m => m.medication_id === medicationId || m.id === medicationId);
    if (medication) {
      try {
        const result = await awsMedicationAPI.logMedicationAction({
          medication_name: medication.medication_name || medication.name,
          status: 'taken'
        });
        
        if (result.status === 'success') {
          onMarkAsTaken(medicationId);
        }
      } catch (error) {
        console.error('Error logging medication:', error);
        // Still mark as taken locally even if API fails
        onMarkAsTaken(medicationId);
      }
    }
  };

  const handleAddTestData = async () => {
    setAddingTestData(true);
    try {
      const result = await awsMedicationAPI.addTestData();
      console.log('Test data result:', result);
      alert('Test data added! Check the medications list.');
      // Reload the page to see new data
      window.location.reload();
    } catch (error) {
      console.error('Error adding test data:', error);
      alert('Error adding test data: ' + error.message);
    } finally {
      setAddingTestData(false);
    }
  };

  const getNextMedicationTime = (times) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const futureTimes = times.filter(time => time > currentTime);
    if (futureTimes.length > 0) {
      return futureTimes[0];
    }
    return times[0]; // Return first time tomorrow
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const clearCache = () => {
    awsMedicationAPI.clearCache();
    alert('Local cache cleared. Page will reload.');
    window.location.reload();
  };

  return (
    <div className="medication-manager">
      <div className="section-header">
        <div>
          <h2>Your Medications</h2>
          <div className={`api-status ${apiStatus}`}>
            AWS API: {apiStatus === 'online' ? '✅ Connected' : '❌ Offline'}
            {apiStatus === 'offline' && (
              <button onClick={clearCache} className="clear-cache-btn">
                Clear Cache
              </button>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="test-data-btn"
            onClick={handleAddTestData}
            disabled={addingTestData || loading}
          >
            {addingTestData ? 'Adding Test Data...' : '📝 Add Test Data'}
          </button>
          <button 
            className="notification-btn"
            onClick={requestNotificationPermission}
          >
            🔔 Enable Notifications
          </button>
          <button 
            className="add-med-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
          >
            {loading ? 'Adding...' : (showAddForm ? 'Cancel' : '+ Add Medication')}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form className="add-med-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Medication name *"
              value={newMed.name}
              onChange={(e) => setNewMed({...newMed, name: e.target.value})}
              required
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 100mg)"
              value={newMed.dosage}
              onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
              disabled={loading}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Times (e.g., 08:00, 20:00) *"
              value={newMed.times}
              onChange={(e) => setNewMed({...newMed, times: e.target.value})}
              required
              disabled={loading}
            />
            <select
              value={newMed.timezone}
              onChange={(e) => setNewMed({...newMed, timezone: e.target.value})}
              disabled={loading}
            >
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
          <div className="form-help">
            <small>💡 Separate multiple times with commas. Your AWS Lambda will send SMS reminders.</small>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding to AWS...' : 'Add Medication'}
          </button>
        </form>
      )}

      <div className="medications-grid">
        {medications.map(med => (
          <div key={med.medication_id || med.id} className={`medication-card ${med.taken ? 'taken' : ''}`}>
            <div className="med-icon">
              {med.type === 'pill' && '💊'}
              {med.type === 'liquid' && '🥤'}
              {med.type === 'injection' && '💉'}
              {med.type === 'supplement' && '🌿'}
            </div>
            <div className="med-info">
              <h3>{med.medication_name || med.name}</h3>
              <p className="dosage">{med.dosage}</p>
              <div className="schedule">
                <span className="schedule-label">Schedule ({med.timezone || 'Asia/Shanghai'}):</span>
                <div className="times">
                  {med.times && med.times.map((time, index) => (
                    <span key={index} className="time-badge">{time}</span>
                  ))}
                </div>
              </div>
              <p className="next-dose">
                Next: {med.times && med.times.length > 0 ? getNextMedicationTime(med.times) : 'No schedule'}
              </p>
              {med.source === 'local_cache' && (
                <p className="cache-notice">🔄 Stored locally (API offline)</p>
              )}
              {med.medication_id && med.medication_id.startsWith('med_') && (
                <p className="aws-id">AWS ID: {med.medication_id}</p>
              )}
            </div>
            <div className="med-actions">
              {!med.taken ? (
                <button 
                  className="take-btn"
                  onClick={() => handleMarkAsTaken(med.medication_id || med.id)}
                >
                  Mark Taken
                </button>
              ) : (
                <span className="taken-badge">✅ Taken</span>
              )}
            </div>
          </div>
        ))}
        
        {medications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No medications in DynamoDB</h3>
            <p>Click "Add Test Data" to populate your AWS DynamoDB table with sample medications</p>
            <div className="empty-actions">
              <button 
                className="add-first-btn"
                onClick={handleAddTestData}
                disabled={addingTestData}
              >
                {addingTestData ? 'Adding...' : '📝 Add Test Data to AWS'}
              </button>
              <button 
                className="add-first-btn secondary"
                onClick={() => setShowAddForm(true)}
              >
                + Add Custom Medication
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationManager;
