import React, { useState } from 'react';
import awsDailyLivingAPI from '../utils/awsDailyLivingAPI.js';

const DailyLivingSupport = () => {
  const [activeSection, setActiveSection] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    user_id: 'user_123',
    action_type: 'get_today_summary',
    meal_type: 'lunch',
    meal_items: '',
    completion_level: 'full',
    appointment_type: 'all',
    activity_type: 'walk',
    duration_minutes: 15
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const callDailyLivingAPI = async (actionData) => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔄 Calling Daily Living API with:', actionData);
      const response = await awsDailyLivingAPI.callDailyLivingAPI(actionData);
      console.log('✅ API Response:', response);
      setResult(response);
    } catch (error) {
      console.error('❌ API Call Failed:', error);
      setResult({
        status: 'error',
        message: `API call failed: ${error.message}`,
        data: getFallbackData(actionData.action_type)
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback data in case API fails
  const getFallbackData = (actionType) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (actionType) {
      case 'appointment_check':
        return {
          user_id: 'user_123',
          appointment_type: 'all',
          total_appointments: 3,
          next_appointment: {
            id: "apt_001",
            type: "medical",
            provider: "Dr. Smith - Cardiology",
            date_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: "123 Main St, Suite 400",
            preparation: "Fasting required for 12 hours before",
            transportation: "scheduled"
          },
          all_appointments: [
            {
              id: "apt_001",
              type: "medical",
              provider: "Dr. Smith - Cardiology",
              date_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: "123 Main St, Suite 400",
              preparation: "Fasting required for 12 hours before",
              transportation: "scheduled"
            },
            {
              id: "apt_002",
              type: "therapy",
              provider: "Physical Therapy Center",
              date_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              location: "456 Oak Avenue",
              preparation: "Wear comfortable clothing",
              transportation: "family"
            },
            {
              id: "apt_003",
              type: "social",
              provider: "Bridge Club",
              date_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
              location: "Community Center",
              preparation: "Bring your card deck",
              transportation: "volunteer"
            }
          ],
          today_appointments: [],
          reminders: [
            `Tomorrow: Physical Therapy Center`,
            `Today: Bridge Club at ${new Date(now.getTime() + 4 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
          ]
        };
      
      case 'hydration_track':
        return {
          user_id: 'user_123',
          daily_goal_glasses: 8,
          consumed_today: 5,
          remaining_glasses: 3,
          hydration_status: "needs_improvement",
          last_drink_time: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          reminders: [
            "Time for water! You have 3 glasses to go today",
            "Staying hydrated helps with energy and digestion"
          ],
          tips: [
            "Keep a water bottle nearby",
            "Drink a glass with each meal",
            "Set hourly reminders if needed"
          ]
        };
      
      case 'get_today_summary':
        return {
          user_id: 'user_123',
          date: today,
          wellness_score: 85,
          daily_data: {
            meals_logged: 2,
            medications_taken: "95%",
            water_glasses: 5,
            activities_completed: 2,
            mood: "content",
            sleep_hours: "7.2",
            steps_taken: 4231
          },
          achievements: [
            "✅ Medications taken on schedule",
            "✅ Stayed active throughout day"
          ],
          areas_for_improvement: [
            "💧 Drink more water - aim for 6-8 glasses",
            "🍽️ Try to eat 3 meals for consistent energy"
          ],
          tomorrow_goals: [
            "Drink 3 more glasses of water",
            "Take all medications as scheduled",
            "Eat 3 balanced meals"
          ],
          caregiver_notes: "Good progress today! Remember to stay hydrated."
        };
      
      default:
        return { message: "Fallback data not available for this action" };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    callDailyLivingAPI(formData);
  };

  const quickAction = (actionType, extraData = {}) => {
    const data = { ...formData, action_type: actionType, ...extraData };
    setActiveSection(actionType);
    callDailyLivingAPI(data);
  };

  const switchToForm = (section) => {
    setActiveSection(section);
    setResult(null);
  };

  // Render functions for different result types
  const renderTodaySummary = (data) => {
    if (!data) return <div className="error-message">No data available</div>;
    
    return (
      <div className="summary-container">
        <div className="wellness-header">
          <div className="wellness-score">
            <div className="score-circle">
              <span className="score-value">{data.wellness_score || 0}</span>
              <span className="score-label">Wellness Score</span>
            </div>
          </div>
          <div className="summary-date">
            <h3>📊 Today's Summary</h3>
            <p>{data.date || new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div className="daily-stats">
          <h4>Daily Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-icon">🍽️</span>
              <span className="stat-value">{(data.daily_data?.meals_logged || 0)}/3</span>
              <span className="stat-label">Meals</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💊</span>
              <span className="stat-value">{data.daily_data?.medications_taken || '0%'}</span>
              <span className="stat-label">Medications</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💧</span>
              <span className="stat-value">{(data.daily_data?.water_glasses || 0)}/8</span>
              <span className="stat-label">Water</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🚶</span>
              <span className="stat-value">{data.daily_data?.activities_completed || 0}</span>
              <span className="stat-label">Activities</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">😊</span>
              <span className="stat-value">{data.daily_data?.mood || 'Unknown'}</span>
              <span className="stat-label">Mood</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛌</span>
              <span className="stat-value">{data.daily_data?.sleep_hours || '0'}h</span>
              <span className="stat-label">Sleep</span>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h4>🎯 Today's Achievements</h4>
          <div className="achievements-list">
            {(data.achievements || []).map((achievement, index) => (
              <div key={index} className="achievement-item">
                {achievement}
              </div>
            ))}
            {(!data.achievements || data.achievements.length === 0) && (
              <div className="achievement-item">
                ✅ Completed daily check-in
              </div>
            )}
          </div>
        </div>

        <div className="improvement-section">
          <h4>📈 Areas for Improvement</h4>
          <div className="improvement-list">
            {(data.areas_for_improvement || []).map((improvement, index) => (
              <div key={index} className="improvement-item">
                {improvement}
              </div>
            ))}
            {(!data.areas_for_improvement || data.areas_for_improvement.length === 0) && (
              <div className="improvement-item">
                💪 Keep up the good work!
              </div>
            )}
          </div>
        </div>

        <div className="goals-section">
          <h4>🎯 Tomorrow's Goals</h4>
          <div className="goals-list">
            {(data.tomorrow_goals || []).map((goal, index) => (
              <div key={index} className="goal-item">
                <span className="goal-icon">⭐</span>
                <span>{goal}</span>
              </div>
            ))}
            {(!data.tomorrow_goals || data.tomorrow_goals.length === 0) && (
              <div className="goal-item">
                <span className="goal-icon">⭐</span>
                <span>Take all medications as scheduled</span>
              </div>
            )}
          </div>
        </div>

        {data.caregiver_notes && (
          <div className="caregiver-notes">
            <h4>📝 Caregiver Notes</h4>
            <p>{data.caregiver_notes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderAppointmentCheck = (data) => {
    if (!data) return <div className="error-message">No appointment data available</div>;
    
    return (
      <div className="appointment-result">
        <div className="result-header info">
          <h3>📅 Appointment Overview</h3>
          <p>Found {data.total_appointments || 0} upcoming appointments</p>
        </div>

        {data.next_appointment && (
          <div className="next-appointment">
            <h4>🕐 Next Appointment</h4>
            <div className="appointment-card highlight">
              <div className="appointment-type">{data.next_appointment.type?.toUpperCase() || 'APPOINTMENT'}</div>
              <h5>{data.next_appointment.provider || 'Appointment'}</h5>
              <p><strong>When:</strong> {new Date(data.next_appointment.date_time).toLocaleString()}</p>
              <p><strong>Where:</strong> {data.next_appointment.location || 'Location not specified'}</p>
              <p><strong>Preparation:</strong> {data.next_appointment.preparation || 'No special preparation needed'}</p>
              <p><strong>Transport:</strong> {data.next_appointment.transportation || 'To be arranged'}</p>
            </div>
          </div>
        )}

        <div className="appointments-list">
          <h4>📋 All Upcoming Appointments</h4>
          {(data.all_appointments || []).map((appointment, index) => (
            <div key={appointment.id || index} className="appointment-card">
              <div className="appointment-header">
                <span className="appointment-type">{appointment.type?.toUpperCase() || 'GENERAL'}</span>
                <span className="appointment-date">
                  {new Date(appointment.date_time).toLocaleDateString()}
                </span>
              </div>
              <h5>{appointment.provider || 'Healthcare Provider'}</h5>
              <p>{appointment.location || 'Location not specified'}</p>
            </div>
          ))}
          {(!data.all_appointments || data.all_appointments.length === 0) && (
            <div className="no-appointments">
              <p>No upcoming appointments scheduled.</p>
            </div>
          )}
        </div>

        {data.reminders && data.reminders.length > 0 && (
          <div className="reminders-section">
            <h4>🔔 Reminders</h4>
            <div className="reminders-list">
              {data.reminders.map((reminder, index) => (
                <div key={index} className="reminder-item">
                  ⏰ {reminder}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHydrationTrack = (data) => {
    if (!data) return <div className="error-message">No hydration data available</div>;
    
    const consumed = data.consumed_today || 0;
    const goal = data.daily_goal_glasses || 8;
    const percentage = Math.min((consumed / goal) * 100, 100);
    
    return (
      <div className="hydration-result">
        <div className="result-header info">
          <h3>💧 Hydration Tracking</h3>
          <p>{consumed}/{goal} glasses today</p>
        </div>

        <div className="hydration-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {consumed} of {goal} glasses ({Math.round(percentage)}%)
          </div>
        </div>

        <div className="hydration-status">
          <div className={`status-badge ${data.hydration_status || 'needs_improvement'}`}>
            {data.hydration_status === 'good' ? '👍 Good' : '💪 Needs Improvement'}
          </div>
          <p>{data.remaining_glasses || 3} glasses remaining today</p>
        </div>

        <div className="hydration-tips">
          <h4>💡 Tips for Better Hydration</h4>
          <div className="tips-list">
            {(data.tips || []).map((tip, index) => (
              <div key={index} className="tip-item">
                {tip}
              </div>
            ))}
            {(!data.tips || data.tips.length === 0) && (
              <>
                <div className="tip-item">Keep a water bottle nearby</div>
                <div className="tip-item">Drink a glass with each meal</div>
                <div className="tip-item">Set hourly reminders if needed</div>
              </>
            )}
          </div>
        </div>

        <div className="hydration-reminders">
          <h4>🔔 Reminders</h4>
          {(data.reminders || []).map((reminder, index) => (
            <div key={index} className="reminder-card">
              {reminder}
            </div>
          ))}
          {(!data.reminders || data.reminders.length === 0) && (
            <div className="reminder-card">
              Time for water! You have {data.remaining_glasses || 3} glasses to go today
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;

    const actionType = result.action_type || formData.action_type;
    const data = result.data;
    
    if (result.status === 'error') {
      return (
        <div className="error-container">
          <div className="error-header">
            <h3>❌ Error</h3>
            <p>{result.message}</p>
          </div>
          <div className="fallback-message">
            <p>Showing fallback data instead:</p>
          </div>
        </div>
      );
    }

    switch (actionType) {
      case 'get_today_summary':
        return renderTodaySummary(data);
      case 'appointment_check':
        return renderAppointmentCheck(data);
      case 'hydration_track':
        return renderHydrationTrack(data);
      default:
        return (
          <div className="result-data">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  // Determine which content to show
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing your request...</p>
        </div>
      );
    }

    if (result && !loading) {
      return (
        <div className={`result-container ${result.status}`}>
          {renderResult()}
          <div className="back-button">
            <button onClick={() => setResult(null)}>
              ← Back to {activeSection.replace(/_/g, ' ')}
            </button>
          </div>
        </div>
      );
    }

    // Show forms or info messages based on active section
    switch (activeSection) {
      case 'get_today_summary':
      case 'appointment_check':
      case 'hydration_track':
        return (
          <div className="info-message">
            <p>Click the "{activeSection.replace(/_/g, ' ')}" button above to see your information.</p>
            <p className="hint">If the page appears blank, the API might be loading or there might be a connection issue.</p>
          </div>
        );

      default:
        return (
          <div className="info-message">
            <p>Select an option from the menu above to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="daily-living-support">
      <div className="support-header">
        <h2>🌱 Daily Living Support</h2>
        <p>Track meals, appointments, hydration, and activities for better daily wellness</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className={`quick-btn ${activeSection === 'get_today_summary' ? 'active' : ''}`}
          onClick={() => quickAction('get_today_summary')}
          disabled={loading}
        >
          📊 Today's Summary
        </button>
        <button 
          className={`quick-btn ${activeSection === 'appointment_check' ? 'active' : ''}`}
          onClick={() => quickAction('appointment_check')}
          disabled={loading}
        >
          📅 Appointments
        </button>
        <button 
          className={`quick-btn ${activeSection === 'hydration_track' ? 'active' : ''}`}
          onClick={() => quickAction('hydration_track')}
          disabled={loading}
        >
          💧 Hydration
        </button>
      </div>

      {/* Main Content Area */}
      <div className="support-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .daily-living-support {
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .support-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .support-header h2 {
          color: #059669;
          margin-bottom: 0.5rem;
        }

        .support-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .quick-btn {
          padding: 1rem 0.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .quick-btn:hover:not(:disabled) {
          border-color: #059669;
          transform: translateY(-2px);
        }

        .quick-btn.active {
          border-color: #059669;
          background: #ecfdf5;
          color: #059669;
        }

        .quick-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .support-content {
          min-height: 300px;
        }

        .loading {
          text-align: center;
          padding: 2rem;
        }

        .spinner {
          border: 4px solid #f3f4f6;
          border-top: 4px solid #059669;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .result-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .back-button {
          margin-top: 1.5rem;
          text-align: center;
        }

        .back-button button {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .back-button button:hover {
          background: #4b5563;
        }

        .error-container {
          text-align: center;
          padding: 2rem;
        }

        .error-header {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .error-header h3 {
          color: #dc2626;
          margin: 0 0 0.5rem 0;
        }

        .fallback-message {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 1rem;
          color: #0369a1;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          color: #dc2626;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .no-appointments {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-style: italic;
        }

        .hint {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 0.5rem;
        }

        /* Add all the other existing styles from previous component */
        .result-header {
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .result-header.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .result-header.info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .summary-container {
          space-y: 1.5rem;
        }

        .wellness-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .wellness-score {
          display: flex;
          align-items: center;
        }

        .score-circle {
          background: linear-gradient(135deg, #10B981, #3B82F6);
          color: white;
          padding: 1.5rem;
          border-radius: 50%;
          width: 100px;
          height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .score-value {
          font-size: 1.8rem;
          font-weight: bold;
        }

        .score-label {
          font-size: 0.7rem;
          opacity: 0.9;
        }

        .summary-date h3 {
          margin: 0;
          color: #1F2937;
        }

        .summary-date p {
          margin: 0.25rem 0 0 0;
          color: #6B7280;
        }

        .daily-stats {
          margin-bottom: 1.5rem;
        }

        .daily-stats h4 {
          margin-bottom: 1rem;
          color: #374151;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          display: block;
          font-weight: bold;
          font-size: 1.2rem;
          color: #1F2937;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6B7280;
        }

        .achievements-section,
        .improvement-section,
        .goals-section {
          margin-bottom: 1.5rem;
        }

        .achievements-section h4,
        .improvement-section h4,
        .goals-section h4 {
          margin-bottom: 0.75rem;
          color: #374151;
        }

        .achievements-list,
        .improvement-list,
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .achievement-item,
        .improvement-item,
        .goal-item {
          padding: 0.75rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }

        .achievement-item {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .improvement-item {
          background: #fef3f2;
          border: 1px solid #fecaca;
          color: #92400e;
        }

        .goal-item {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
        }

        .goal-icon {
          margin-right: 0.5rem;
        }

        .caregiver-notes {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .caregiver-notes h4 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }

        .caregiver-notes p {
          margin: 0;
          color: #6B7280;
        }

        /* Appointment Styles */
        .appointment-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1rem;
        }

        .appointment-card.highlight {
          background: #eff6ff;
          border: 2px solid #3B82F6;
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .appointment-type {
          background: #3B82F6;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .appointment-date {
          color: #6B7280;
          font-size: 0.8rem;
        }

        .appointment-card h5 {
          margin: 0 0 0.5rem 0;
          color: #1F2937;
        }

        .appointment-card p {
          margin: 0.25rem 0;
          color: #6B7280;
          font-size: 0.9rem;
        }

        .reminders-section {
          margin-top: 1.5rem;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reminder-item {
          background: #fef3c7;
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #fcd34d;
          color: #92400e;
        }

        /* Hydration Styles */
        .hydration-progress {
          margin: 1.5rem 0;
        }

        .progress-bar {
          background: #e5e7eb;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          color: #6B7280;
          font-weight: 500;
        }

        .hydration-status {
          text-align: center;
          margin: 1.5rem 0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .status-badge.good {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.needs_improvement {
          background: #fef3c7;
          color: #92400e;
        }

        .hydration-tips,
        .hydration-reminders {
          margin: 1.5rem 0;
        }

        .tips-list,
        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tip-item,
        .reminder-card {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .info-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .quick-actions {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .daily-living-support {
            padding: 1rem;
          }

          .wellness-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DailyLivingSupport;
