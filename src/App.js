import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MedicationList from './components/MedicationList';
import AddMedication from './components/AddMedication';
import ConvAIChat from './components/ConvAIChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MedicationList />} />
            <Route path="/add" element={<AddMedication />} />
            <Route path="/edit/:id" element={<AddMedication />} />
          </Routes>
        </main>
        <Footer />
        
        {/* ConvAI Chat Component */}
        <ConvAIChat />
      </div>
    </Router>
  );
}

export default App;
