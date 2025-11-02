import React, { useState } from 'react';

const MedicationManager = ({ medications, onMarkAsTaken, onAddMedication }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    times: '',
    type: 'pill'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMed.name && newMed.times) {
      onAddMedication({
        ...newMed,
        times: newMed.times.split(',').map(time => time.trim())
      });
      setNewMed({ name: '', dosage: '', times: '', type: 'pill' });
      setShowAddForm(false);
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

  return (
    <div className="medication-manager">
      <div className="section-header">
        <h2>Your Medications</h2>
        <button 
          className="add-med-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Medication'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-med-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Medication name"
              value={newMed.name}
              onChange={(e) => setNewMed({...newMed, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 100mg)"
              value={newMed.dosage}
              onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Times (e.g., 08:00, 20:00)"
              value={newMed.times}
              onChange={(e) => setNewMed({...newMed, times: e.target.value})}
              required
            />
            <select
              value={newMed.type}
              onChange={(e) => setNewMed({...newMed, type: e.target.value})}
            >
              <option value="pill">Pill</option>
              <option value="liquid">Liquid</option>
              <option value="injection">Injection</option>
              <option value="supplement">Supplement</option>
            </select>
          </div>
          <button type="submit" className="submit-btn">Add Medication</button>
        </form>
      )}

      <div className="medications-grid">
        {medications.map(med => (
          <div key={med.id} className={`medication-card ${med.taken ? 'taken' : ''}`}>
            <div className="med-icon">
              {med.type === 'pill' && '💊'}
              {med.type === 'liquid' && '🥤'}
              {med.type === 'injection' && '💉'}
              {med.type === 'supplement' && '🌿'}
            </div>
            <div className="med-info">
              <h3>{med.name}</h3>
              <p className="dosage">{med.dosage}</p>
              <div className="schedule">
                <span className="schedule-label">Schedule:</span>
                <div className="times">
                  {med.times.map((time, index) => (
                    <span key={index} className="time-badge">{time}</span>
                  ))}
                </div>
              </div>
              <p className="next-dose">
                Next: {getNextMedicationTime(med.times)}
              </p>
            </div>
            <div className="med-actions">
              {!med.taken ? (
                <button 
                  className="take-btn"
                  onClick={() => onMarkAsTaken(med.id)}
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
            <h3>No medications added</h3>
            <p>Add your first medication to get started with reminders</p>
            <button 
              className="add-first-btn"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Medication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationManager;
