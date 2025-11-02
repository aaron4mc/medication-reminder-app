import React, { useState } from 'react';
import awsDailyLivingAPI from '../utils/awsDailyLivingAPI.js';

const DailyLivingSupport = () => {
  const [activeSection, setActiveSection] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    user_id: 'user_123', // Default user ID
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
          <div className={`result ${result.status}`}>
            <h3>{result.status === 'success' ? '✅ Success' : '❌ Error'}</h3>
            <p>{result.message}</p>
            {result.data && (
              <div className="result-data">
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Meal Logging Form */}
        {activeSection === 'meal_log' && (
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
        {activeSection === 'activity_log' && (
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

        .result {
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .result.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .result.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .result-data {
          margin-top: 1rem;
          background: white;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .result-data pre {
          margin: 0;
          font-size: 0.8rem;
          white-space: pre-wrap;
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
        }
      `}</style>
    </div>
  );
};

export default DailyLivingSupport;
