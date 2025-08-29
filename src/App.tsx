import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { RecyclingProvider } from './contexts/RecyclingContext';
import { ParticleCanvas } from './components/particles/ParticleEngine';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <RecyclingProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <ParticleCanvas />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </RecyclingProvider>
    </WalletProvider>
  );
}

export default App;