import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation de connexion pour le moment
      const userData = {
        username: formData.username,
        full_name: 'Utilisateur Test',
        role: 'admin'
      };
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #064e3b 0%, #10b981 50%, #34d399 100%)',
    padding: '20px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const formStyle = {
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '16px'
  };

  const buttonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: 'white',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const demoStyle = {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>🌿 Wildlife Tracker</h1>
          <p style={{ color: '#6b7280' }}>Système de suivi des espèces</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && (
            <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Connexion...' : '🔑 Se connecter'}
          </button>
        </form>

        <div style={demoStyle}>
          <h4 style={{ color: '#166534', fontSize: '14px', marginBottom: '8px' }}>
            Accès de démonstration :
          </h4>
          <p style={{ color: '#15803d', fontSize: '13px', margin: '4px 0' }}>
            <strong>Utilisateur :</strong> admin
          </p>
          <p style={{ color: '#15803d', fontSize: '13px', margin: '4px 0' }}>
            <strong>Mot de passe :</strong> admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
