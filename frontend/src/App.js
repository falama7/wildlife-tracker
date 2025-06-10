import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SpeciesManagement from './pages/SpeciesManagement';
import ObservationsMap from './pages/ObservationsMap';
import DataEntry from './pages/DataEntry';
import Login from './pages/Login';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de vérification auth
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const mainStyle = {
    marginLeft: user ? '260px' : '0',
    padding: user ? '20px' : '0',
    flex: 1,
    overflowX: 'hidden'
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main style={mainStyle}>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/species" element={<SpeciesManagement />} />
                <Route path="/map" element={<ObservationsMap />} />
                <Route path="/data-entry" element={<DataEntry />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
