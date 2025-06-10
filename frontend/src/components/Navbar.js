import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navStyle = {
    background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '260px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
  };

  const brandStyle = {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '20px',
    fontWeight: '700'
  };

  const menuStyle = {
    flex: 1,
    padding: '20px 0'
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    borderLeft: '3px solid #34d399'
  };

  const userStyle = {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const logoutBtnStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%'
  };

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/species', label: 'Espèces', icon: '🦁' },
    { path: '/map', label: 'Cartographie', icon: '🗺️' },
    { path: '/data-entry', label: 'Saisie données', icon: '📝' }
  ];

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          🌿 Wildlife Tracker
        </Link>
      </div>

      <div style={menuStyle}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={location.pathname === item.path ? activeLinkStyle : linkStyle}
          >
            <span style={{ marginRight: '12px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <div style={userStyle}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: '600' }}>{user.full_name || user.username}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {user.role}
          </div>
        </div>
        <button onClick={onLogout} style={logoutBtnStyle}>
          🚪 Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
