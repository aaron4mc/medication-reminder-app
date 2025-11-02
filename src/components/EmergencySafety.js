import React, { useState, useEffect } from 'react';

const EmergencySafety = () => {
  const [emergencyStatus, setEmergencyStatus] = useState('all_clear');
  const [safetyScore, setSafetyScore] = useState(95);
  const [lastCheckIn, setLastCheckIn] = useState('');
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [safetyMetrics, setSafetyMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current time for last check-in
  useEffect(() => {
    setLastCheckIn(new Date().toISOString());
    performSafetyCheck();
    
    // Set up periodic safety checks (every 2 hours)
    const interval = setInterval(performSafetyCheck, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const performSafetyCheck = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to your safety check endpoint
      const response = await simulateSafetyCheckAPI();
      setSafetyScore(response.data.safety_score);
      setSafetyMetrics(response.data.safety_metrics);
      setLastCheckIn(new Date().toISOString());
      
      // Update emergency status based on alerts
      if (response.data.alerts.length > 0) {
        const highestSeverity = response.data.alerts.reduce((max, alert) => 
          getSeverityLevel(alert.severity) > getSeverityLevel(max.severity) ? alert : max
        );
        setEmergencyStatus(highestSeverity.severity);
      } else {
        setEmergencyStatus('all_clear');
      }
    } catch (error) {
      console.error('Safety check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSafetyCheckAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const metrics = {
          last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          vitals_status: "normal",
          medication_adherence: "92%",
          environment_safety: "secure",
          connectivity_status: "stable",
          battery_level: "78%"
        };
        
        const alerts = [];
        if (Math.random() > 0.7) {
          alerts.push({
            type: "prolonged_inactivity",
            severity: "medium",
            message: "Limited activity detected in last hour",
            action: "initiate_check_in"
          });
        }
        
        resolve({
          status: "success",
          data: {
            safety_score: 85 + Math.floor(Math.random() * 15),
            safety_status: "all_clear",
            safety_metrics: metrics,
            alerts: alerts,
            recommendations: [
              "Take a short walk or stretch",
              "Check medication schedule",
              "Verify emergency contacts are updated"
            ]
          }
        });
      }, 1000);
    });
  };

  const triggerEmergency = async (emergencyType, severity = 'medium') => {
    setIsLoading(true);
    try {
      const response = await simulateEmergencyAPI(emergencyType, severity);
      setActiveIncidents(prev => [...prev, response.emergency_response]);
      setEmergencyStatus(severity);
      
      // Show emergency instructions to user
      alert(`🚨 EMERGENCY PROTOCOL ACTIVATED\n\n${response.emergency_response.user_instructions}`);
    } catch (error) {
      console.error('Emergency trigger failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateEmergencyAPI = (emergencyType, severity) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseResponse = {
          status: "success",
          emergency_response: {
            incident_id: `emergency_${Date.now()}`,
            user_id: "test_user_123",
            emergency_type: emergencyType,
            severity_level: severity,
            timestamp: new Date().toISOString(),
            user_responsive: true,
            location: "home",
            monitoring_active: true
          }
        };

        switch (emergencyType) {
          case 'fall':
            baseResponse.message = "Fall emergency protocol activated";
            baseResponse.emergency_response.actions_taken = [
              "Emergency services dispatched",
              "All contacts notified",
              "Continuous monitoring activated"
            ];
            baseResponse.emergency_response.user_instructions = "HELP IS COMING! Stay still if injured. EMS has been dispatched to your location.";
            baseResponse.emergency_response.responder_eta = "5-8 minutes";
            break;

          case 'medical':
            baseResponse.message = "Medical emergency protocol activated";
            baseResponse.emergency_response.actions_taken = [
              "Medical services alerted",
              "Emergency contacts notified",
              "Medical history provided to responders"
            ];
            baseResponse.emergency_response.user_instructions = "MEDICAL HELP IS ARRIVING! Stay calm and try to breathe slowly. Help is on the way.";
            baseResponse.emergency_response.responder_contact = "EMS and primary physician";
            break;

          case 'verbal_distress':
            baseResponse.message = "Crisis support protocol activated";
            baseResponse.emergency_response.actions_taken = [
              "Primary caregiver contacted",
              "Support resources activated",
              "Follow-up scheduled"
            ];
            baseResponse.emergency_response.user_instructions = "You're not alone. Help is available and people care about you. Your caregiver has been notified and will contact you shortly.";
            break;

          default:
            baseResponse.message = "Emergency protocol activated";
            baseResponse.emergency_response.actions_taken = ["Emergency contacts notified", "Situation assessment initiated"];
            baseResponse.emergency_response.user_instructions = "Help is being arranged. Please stay on the line and provide any additional information.";
        }

        resolve(baseResponse);
      }, 1500);
    });
  };

  const sendCheckInReminder = async () => {
    setIsLoading(true);
    try {
      const response = await simulateCheckInAPI();
      setLastCheckIn(new Date().toISOString());
      alert(`✅ Safety check-in sent!\n\nPlease respond to the check-in questions.`);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCheckInAPI = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: "success",
          message: "Safety check-in reminder sent",
          data: {
            reminder_id: `checkin_${Date.now()}`,
            check_in_questions: [
              "How are you feeling right now?",
              "Do you need any assistance?",
              "Are you comfortable and safe?",
              "Any concerns to report?"
            ],
            escalation_time_minutes: 30,
            auto_escalation: true
          }
        });
      }, 1000);
    });
  };

  const getSeverityLevel = (severity) => {
    const levels = { low: 1, medium: 2, high: 3, critical: 4, all_clear: 0 };
    return levels[severity] || 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      all_clear: '#10B981', // green
      low: '#3B82F6',       // blue
      medium: '#F59E0B',    // yellow
      high: '#EF4444',      // red
      critical: '#DC2626'   // dark red
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      all_clear: '✅',
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🚨'
    };
    return icons[status] || '❓';
  };

  return (
    <div className="emergency-safety">
      {/* Emergency Status Header */}
      <div className="status-header" style={{ borderLeft: `6px solid ${getStatusColor(emergencyStatus)}` }}>
        <div className="status-info">
          <span className="status-icon">{getStatusIcon(emergencyStatus)}</span>
          <div>
            <h2>Emergency & Safety Status</h2>
            <p className={`status-text status-${emergencyStatus}`}>
              {emergencyStatus === 'all_clear' ? 'All Systems Normal' : 
               emergencyStatus === 'critical' ? 'CRITICAL EMERGENCY' : 
               `${emergencyStatus.toUpperCase()} ALERT`}
            </p>
          </div>
        </div>
        <div className="safety-score">
          <div className="score-circle">
            <span className="score-value">{safetyScore}</span>
            <span className="score-label">Safety Score</span>
          </div>
        </div>
      </div>

      {/* Emergency Quick Actions */}
      <div className="emergency-actions">
        <h3>Emergency Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="emergency-btn critical"
            onClick={() => triggerEmergency('fall', 'critical')}
            disabled={isLoading}
          >
            🚨 Fall Emergency
          </button>
          <button 
            className="emergency-btn high"
            onClick={() => triggerEmergency('medical', 'high')}
            disabled={isLoading}
          >
            🏥 Medical Emergency
          </button>
          <button 
            className="emergency-btn medium"
            onClick={() => triggerEmergency('verbal_distress', 'medium')}
            disabled={isLoading}
          >
            🗣️ Verbal Distress
          </button>
          <button 
            className="safety-btn"
            onClick={sendCheckInReminder}
            disabled={isLoading}
          >
            📋 Check-In Reminder
          </button>
        </div>
      </div>

      {/* Safety Metrics Dashboard */}
      <div className="safety-dashboard">
        <div className="dashboard-header">
          <h3>Safety Monitoring</h3>
          <button 
            className="refresh-btn"
            onClick={performSafetyCheck}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-icon">⏱️</span>
            <div className="metric-info">
              <span className="metric-value">
                {safetyMetrics.last_activity ? 
                  `${Math.round((new Date() - new Date(safetyMetrics.last_activity)) / (1000 * 60))}m ago` : 
                  'Loading...'}
              </span>
              <span className="metric-label">Last Activity</span>
            </div>
          </div>
          
          <div className="metric-card">
            <span className="metric-icon">💊</span>
            <div className="metric-info">
              <span className="metric-value">{safetyMetrics.medication_adherence || '92%'}</span>
              <span className="metric-label">Medication Adherence</span>
            </div>
          </div>
          
          <div className="metric-card">
            <span className="metric-icon">🔋</span>
            <div className="metric-info">
              <span className="metric-value">{safetyMetrics.battery_level || '78%'}</span>
              <span className="metric-label">Battery Level</span>
            </div>
          </div>
          
          <div className="metric-card">
            <span className="metric-icon">📡</span>
            <div className="metric-info">
              <span className="metric-value">{safetyMetrics.connectivity_status || 'Stable'}</span>
              <span className="metric-label">Connectivity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="active-incidents">
          <h3>Active Emergency Incidents</h3>
          <div className="incidents-list">
            {activeIncidents.map((incident, index) => (
              <div key={incident.incident_id} className="incident-card">
                <div className="incident-header">
                  <span className="incident-type">{incident.emergency_type.toUpperCase()}</span>
                  <span className={`incident-severity severity-${incident.severity_level}`}>
                    {incident.severity_level}
                  </span>
                </div>
                <div className="incident-details">
                  <p><strong>Time:</strong> {new Date(incident.timestamp).toLocaleTimeString()}</p>
                  <p><strong>Location:</strong> {incident.location}</p>
                  <p><strong>Status:</strong> {incident.user_responsive ? 'User Responsive' : 'No Response'}</p>
                  <div className="actions-taken">
                    <strong>Actions Taken:</strong>
                    <ul>
                      {incident.actions_taken?.map((action, i) => (
                        <li key={i}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Information */}
      <div className="safety-info">
        <h3>Emergency Protocols</h3>
        <div className="protocols-grid">
          <div className="protocol-card">
            <h4>🚨 Fall Detection</h4>
            <p>Automatic EMS dispatch, contact notification, continuous monitoring</p>
          </div>
          <div className="protocol-card">
            <h4>🏥 Medical Emergency</h4>
            <p>Medical services alert, vital info sharing, caregiver notification</p>
          </div>
          <div className="protocol-card">
            <h4>🗣️ Verbal Distress</h4>
            <p>Support activation, caregiver contact, follow-up scheduling</p>
          </div>
          <div className="protocol-card">
            <h4>📋 Safety Check-ins</h4>
            <p>Automated reminders, escalation protocols, contact verification</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .emergency-safety {
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-icon {
          font-size: 2rem;
        }

        .status-text {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .status-all_clear { color: #10B981; }
        .status-low { color: #3B82F6; }
        .status-medium { color: #F59E0B; }
        .status-high { color: #EF4444; }
        .status-critical { color: #DC2626; }

        .safety-score {
          text-align: center;
        }

        .score-circle {
          background: linear-gradient(135deg, #10B981, #3B82F6);
          color: white;
          padding: 1rem;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .score-label {
          font-size: 0.7rem;
          opacity: 0.9;
        }

        .emergency-actions {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .emergency-btn, .safety-btn {
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .emergency-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .emergency-btn.critical {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
        }

        .emergency-btn.high {
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: white;
        }

        .emergency-btn.medium {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color: white;
        }

        .safety-btn {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
        }

        .emergency-btn:disabled, .safety-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .safety-dashboard {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .refresh-btn {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .metric-icon {
          font-size: 1.5rem;
        }

        .metric-value {
          display: block;
          font-weight: bold;
          font-size: 1.1rem;
          color: #1F2937;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #6B7280;
        }

        .active-incidents {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .incident-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          background: #fef2f2;
        }

        .incident-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .incident-type {
          font-weight: bold;
          color: #DC2626;
        }

        .incident-severity {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
          color: white;
        }

        .severity-critical { background: #DC2626; }
        .severity-high { background: #EF4444; }
        .severity-medium { background: #F59E0B; }
        .severity-low { background: #3B82F6; }

        .incident-details p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }

        .actions-taken {
          margin-top: 0.5rem;
        }

        .actions-taken ul {
          margin: 0.25rem 0;
          padding-left: 1rem;
        }

        .actions-taken li {
          font-size: 0.8rem;
          color: #6B7280;
        }

        .safety-info {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .protocols-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .protocol-card {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .protocol-card h4 {
          margin: 0 0 0.5rem 0;
          color: #1F2937;
        }

        .protocol-card p {
          margin: 0;
          font-size: 0.8rem;
          color: #6B7280;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .status-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .protocols-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EmergencySafety;
