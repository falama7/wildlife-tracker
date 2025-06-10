import React, { useState } from 'react';
import './Login.css';
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
      const result = await authService.login(formData.username, formData.password);
      const userData = await authService.getCurrentUser();
      onLogin(userData);
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-overlay"></div>
        <div className="wildlife-pattern">
          <div className="pattern-element">🦁</div>
          <div className="pattern-element">🦒</div>
          <div className="pattern-element">🐘</div>
          <div className="pattern-element">🦛</div>
          <div className="pattern-element">🌳</div>
          <div className="pattern-element">🌴</div>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="app-logo">
              <span className="logo-icon">🌿</span>
              <h1>Wildlife Tracker</h1>
            </div>
            <p className="app-description">
              Système de suivi et d'analyse des espèces dans les parcs nationaux
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Entrez votre nom d'utilisateur"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Entrez votre mot de passe"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <span>🔑</span>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="demo-credentials">
              <h4>Accès de démonstration :</h4>
              <p><strong>Utilisateur :</strong> admin</p>
              <p><strong>Mot de passe :</strong> admin123</p>
            </div>
            
            <div className="app-features">
              <h4>Fonctionnalités :</h4>
              <ul>
                <li>📊 Tableaux de bord analytiques</li>
                <li>🗺️ Cartographie interactive</li>
                <li>📝 Saisie d'observations terrain</li>
                <li>🦁 Gestion des espèces</li>
                <li>🚨 Suivi anti-braconnage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;