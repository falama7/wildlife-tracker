import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulation de stats si l'API n'est pas encore prête
        const mockStats = {
          total_species: 10,
          total_observations: 0,
          recent_observations: 0,
          species_observations: []
        };
        setStats(mockStats);
      } catch (err) {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const descStyle = {
    color: '#6b7280',
    fontSize: '16px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  const cardStyle = {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const iconStyle = {
    fontSize: '32px',
    padding: '12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981, #34d399)'
  };

  const statNumberStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Tableau de Bord</h1>
        <p style={descStyle}>Vue d'ensemble du suivi des espèces dans les parcs nationaux</p>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={iconStyle}>🦁</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>ESPÈCES SUIVIES</h3>
            <div style={statNumberStyle}>{stats?.total_species || 0}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>📍</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>OBSERVATIONS TOTALES</h3>
            <div style={statNumberStyle}>{stats?.total_observations || 0}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>🚨</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>ALERTES ACTIVES</h3>
            <div style={statNumberStyle}>0</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={iconStyle}>👥</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>RANGERS ACTIFS</h3>
            <div style={statNumberStyle}>12</div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>🌿 Wildlife Tracker</h3>
        <p style={{ color: '#6b7280' }}>
          Système opérationnel ! Utilisez le menu de navigation pour accéder aux différentes fonctionnalités.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
