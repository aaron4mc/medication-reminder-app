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
      const response = await awsDailyLivingAPI.callDailyLivingAPI(actionData);
      setResult(response);
    } catch (error) {
      setResult({
        status: 'error',
        message: `API call failed: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    callDailyLivingAPI(formData);
  };

  const quickAction = (actionType, extraData = {}) => {
    const data = { ...formData, action_type: actionType, ...extraData };
    callDailyLivingAPI(data);
    setActiveSection(actionType);
  };

  // Render functions for different result types
  const renderTodaySummary = (data) => (
    <div className="summary-container">
      <div className="wellness-header">
        <div className="wellness-score">
          <div className="score-circle">
            <span className="score-value">{data.wellness_score}</span>
            <span className="score-label">Wellness Score</span>
          </div>
        </div>
        <div className="summary-date">
          <h3>📊 Today's Summary</h3>
          <p>{data.date}</p>
        </div>
      </div>

      <div className="daily-stats">
        <h4>Daily Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">🍽️</span>
            <span className="stat-value">{data.daily_data.meals_logged}/3</span>
            <span className="stat-label">Meals</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💊</span>
            <span className="stat-value">{data.daily_data.medications_taken}</span>
            <span className="stat-label">Medications</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💧</span>
            <span className="stat-value">{data.daily_data.water_glasses}/8</span>
            <span className="stat-label">Water</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🚶</span>
            <span className="stat-value">{data.daily_data.activities_completed}</span>
            <span className="stat-label">Activities</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">😊</span>
            <span className="stat-value">{data.daily_data.mood}</span>
            <span className="stat-label">Mood</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🛌</span>
            <span className="stat-value">{data.daily_data.sleep_hours}h</span>
            <span className="stat-label">Sleep</span>
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h4>🎯 Today's Achievements</h4>
        <div className="achievements-list">
          {data.achievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              {achievement}
            </div>
          ))}
        </div>
      </div>

      <div className="improvement-section">
        <h4>📈 Areas for Improvement</h4>
        <div className="improvement-list">
          {data.areas_for_improvement.map((improvement, index) => (
            <div key={index} className="improvement-item">
              {improvement}
            </div>
          ))}
        </div>
      </div>

      <div className="goals-section">
        <h4>🎯 Tomorrow's Goals</h4>
        <div className="goals-list">
          {data.tomorrow_goals.map((goal, index) => (
            <div key={index} className="goal-item">
              <span className="goal-icon">⭐</span>
              <span>{goal}</span>
            </div>
          ))}
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

  const renderMealLog = (data) => (
    <div className="meal-result">
      <div className="result-header success">
        <h3>✅ Meal Logged Successfully!</h3>
        <p>Your {data.meal_type} has been recorded</p>
      </div>
      
      <div className="meal-details">
        <div className="detail-card">
          <h4>🍽️ Meal Details</h4>
          <div className="detail-item">
            <strong>Type:</strong> {data.meal_type.charAt(0).toUpperCase() + data.meal_type.slice(1)}
          </div>
          <div className="detail-item">
            <strong>Items:</strong> {data.meal_items}
          </div>
          <div className="detail-item">
            <strong>Completion:</strong> {data.completion_level.charAt(0).toUpperCase() + data.completion_level.slice(1)}
          </div>
          <div className="detail-item">
            <strong>Time:</strong> {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>

        <div className="nutrition-feedback">
          <h4>🥦 Nutrition Feedback</h4>
          {data.nutrition_feedback.map((feedback, index) => (
            <div key={index} className="feedback-item">
              {feedback}
            </div>
          ))}
        </div>

        <div className="suggestions">
          <div className="suggestion-card">
            <h4>💡 Next Meal Suggestion</h4>
            <p>{data.next_meal_suggestion}</p>
          </div>
          <div className="suggestion-card">
            <h4>💧 Hydration Reminder</h4>
            <p>{data.hydration_reminder}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentCheck = (data) => (
    <div className="appointment-result">
      <div className="result-header info">
        <h3>📅 Appointment Overview</h3>
        <p>Found {data.total_appointments} upcoming appointments</p>
      </div>

      {data.next_appointment && (
        <div className="next-appointment">
          <h4>🕐 Next Appointment</h4>
          <div className="appointment-card highlight">
            <div className="appointment-type">{data.next_appointment.type.toUpperCase()}</div>
            <h5>{data.next_appointment.provider}</h5>
            <p><strong>When:</strong> {new Date(data.next_appointment.date_time).toLocaleString()}</p>
            <p><strong>Where:</strong> {data.next_appointment.location}</p>
            <p><strong>Preparation:</strong> {data.next_appointment.preparation}</p>
            <p><strong>Transport:</strong> {data.next_appointment.transportation}</p>
          </div>
        </div>
      )}

      <div className="appointments-list">
        <h4>📋 All Upcoming Appointments</h4>
        {data.all_appointments.map((appointment, index) => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-header">
              <span className="appointment-type">{appointment.type.toUpperCase()}</span>
              <span className="appointment-date">
                {new Date(appointment.date_time).toLocaleDateString()}
              </span>
            </div>
            <h5>{appointment.provider}</h5>
            <p>{appointment.location}</p>
          </div>
        ))}
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

  const renderHydrationTrack = (data) => (
    <div className="hydration-result">
      <div className="result-header info">
        <h3>💧 Hydration Tracking</h3>
        <p>{data.consumed_today}/{data.daily_goal_glasses} glasses today</p>
      </div>

      <div className="hydration-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(data.consumed_today / data.daily_goal_glasses) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {data.consumed_today} of {data.daily_goal_glasses} glasses
        </div>
      </div>

      <div className="hydration-status">
        <div className={`status-badge ${data.hydration_status}`}>
          {data.hydration_status === 'good' ? '👍 Good' : '💪 Needs Improvement'}
        </div>
        <p>{data.remaining_glasses} glasses remaining today</p>
      </div>

      <div className="hydration-tips">
        <h4>💡 Tips for Better Hydration</h4>
        <div className="tips-list">
          {data.tips.map((tip, index) => (
            <div key={index} className="tip-item">
              {tip}
            </div>
          ))}
        </div>
      </div>

      <div className="hydration-reminders">
        <h4>🔔 Reminders</h4>
        {data.reminders.map((reminder, index) => (
          <div key={index} className="reminder-card">
            {reminder}
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivityLog = (data) => (
    <div className="activity-result">
      <div className="result-header success">
        <h3>✅ Activity Logged Successfully!</h3>
        <p>Great job staying active!</p>
      </div>

      <div className="activity-details">
        <div className="detail-card">
          <h4>🚶 Activity Details</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Type:</strong> {data.activity_type.charAt(0).toUpperCase() + data.activity_type.slice(1)}
            </div>
            <div className="detail-item">
              <strong>Duration:</strong> {data.duration_minutes} minutes
            </div>
            <div className="detail-item">
              <strong>Calories:</strong> {data.calories_burned} kcal
            </div>
            <div className="detail-item">
              <strong>Intensity:</strong> {data.intensity.charAt(0).toUpperCase() + data.intensity.slice(1)}
            </div>
          </div>
        </div>

        <div className="benefits-card">
          <h4>💪 Health Benefits</h4>
          <p>{data.benefits}</p>
        </div>

        <div className="encouragement-card">
          <h4>🎉 Encouragement</h4>
          <p>{data.encouragement}</p>
        </div>

        <div className="suggestion-card">
          <h4>🔮 Next Activity Suggestion</h4>
          <p>{data.next_activity_suggestion}</p>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result || !result.data) return null;

    switch (result.action_type || formData.action_type) {
      case 'get_today_summary':
        return renderTodaySummary(result.data);
      case 'meal_log':
        return renderMealLog(result.data);
      case 'appointment_check':
        return renderAppointmentCheck(result.data);
      case 'hydration_track':
        return renderHydrationTrack(result.data);
      case 'activity_log':
        return renderActivityLog(result.data);
      default:
        return (
          <div className="result-data">
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
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
          className={`quick-btn ${activeSection === 'meal_log' ? 'active' : ''}`}
          onClick={() => setActiveSection('meal_log')}
          disabled={loading}
        >
          🍽️ Log Meal
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
        <button 
          className={`quick-btn ${activeSection === 'activity_log' ? 'active' : ''}`}
          onClick={() => setActiveSection('activity_log')}
          disabled={loading}
        >
          🚶 Log Activity
        </button>
      </div>

      {/* Main Content Area */}
      <div className="support-content">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your request...</p>
          </div>
        )}

        {result && !loading && (
          <div className={`result-container ${result.status}`}>
            {renderResult()}
          </div>
        )}

        {/* Meal Logging Form */}
        {activeSection === 'meal_log' && !loading && !result && (
          <form onSubmit={handleSubmit} className="support-form">
            <h3>🍽️ Log Your Meal</h3>
            <input type="hidden" name="action_type" value="meal_log" />
            
            <div className="form-group">
              <label>Meal Type:</label>
              <select name="meal_type" value={formData.meal_type} onChange={handleInputChange}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div className="form-group">
              <label>What did you eat?</label>
              <textarea 
                name="meal_items"
                value={formData.meal_items}
                onChange={handleInputChange}
                placeholder="Describe your meal (e.g., chicken soup, whole wheat bread, apple)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>How much did you eat?</label>
              <select name="completion_level" value={formData.completion_level} onChange={handleInputChange}>
                <option value="full">Full meal</option>
                <option value="partial">Partial meal</option>
                <option value="none">Didn't eat</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Meal'}
            </button>
          </form>
        )}

        {/* Activity Logging Form */}
        {activeSection === 'activity_log' && !loading && !result && (
          <form onSubmit={handleSubmit} className="support-form">
            <h3>🚶 Log Your Activity</h3>
            <input type="hidden" name="action_type" value="activity_log" />
            
            <div className="form-group">
              <label>Activity Type:</label>
              <select name="activity_type" value={formData.activity_type} onChange={handleInputChange}>
                <option value="walk">Walk</option>
                <option value="exercise">Exercise</option>
                <option value="social">Social Activity</option>
                <option value="hobby">Hobby</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (minutes):</label>
              <input 
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                min="1"
                max="240"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </form>
        )}

        {/* Info Display when using quick actions */}
        {['get_today_summary', 'appointment_check', 'hydration_track'].includes(activeSection) && !loading && !result && (
          <div className="info-message">
            <p>Click the button above to get your {activeSection.replace(/_/g, ' ')} information.</p>
          </div>
        )}
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
        }

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

        /* Today's Summary Styles */
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

        /* Meal Log Styles */
        .meal-details,
        .activity-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-card,
        .benefits-card,
        .encouragement-card,
        .suggestion-card {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .detail-card h4,
        .benefits-card h4,
        .encouragement-card h4,
        .suggestion-card h4 {
          margin: 0 0 0.75rem 0;
          color: #374151;
        }

        .detail-item {
          margin-bottom: 0.5rem;
        }

        .detail-item strong {
          color: #374151;
        }

        .nutrition-feedback {
          background: #ecfdf5;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #a7f3d0;
        }

        .nutrition-feedback h4 {
          margin: 0 0 0.75rem 0;
          color: #065f46;
        }

        .feedback-item {
          margin-bottom: 0.5rem;
          color: #065f46;
        }

        .suggestions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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

        /* Activity Styles */
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .support-form {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .support-form h3 {
          margin-bottom: 1.5rem;
          color: #059669;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .form-group textarea {
          resize: vertical;
        }

        .support-form button {
          width: 100%;
          padding: 0.75rem;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .support-form button:hover:not(:disabled) {
          background: #047857;
        }

        .support-form button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
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

          .suggestions {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyLivingSupport;
