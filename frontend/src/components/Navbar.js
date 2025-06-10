import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/species', label: 'Espèces', icon: '🦁' },
    { path: '/map', label: 'Cartographie', icon: '🗺️' },
    { path: '/data-entry', label: 'Saisie données', icon: '📝' }
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo et titre */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌿</span>
            <span className="brand-text">Wildlife Tracker</span>
          </Link>
        </div>

        {/* Menu de navigation */}
        <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
          <div className="navbar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user.full_name || user.username}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <div className="user-actions">
            <button onClick={onLogout} className="logout-btn">
              <span>🚪</span> Déconnexion
            </button>
          </div>
        </div>

        {/* Bouton menu mobile */}
        <button
          className={`navbar-burger ${isMenuOpen ? 'is-active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;