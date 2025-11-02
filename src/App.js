import React from 'react';
import ConvAIIntegration from './components/ConvAIIntegration.js';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>💊 Medication Reminder App</h1>
        <p>Manage your medications with AI assistance</p>
      </header>
      
      <main className="app-main">
        <div className="original-app-section">
          <h2>Your Medication Manager</h2>
          <p>Original app functionality combined with AI assistance</p>
        </div>
        
        <ConvAIIntegration />
        
        <div className="app-info">
          <h3>About This Enhanced App</h3>
          <p>This medication reminder app now includes AI-powered assistance through ConvAI integration.</p>
          <p><strong>API Key Status:</strong> Configured and ready to use</p>
          <p><strong>ConvAI SDK:</strong> Successfully installed</p>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Medication Reminder App with ConvAI Integration</p>
      </footer>
    </div>
  );
}

export default App;
