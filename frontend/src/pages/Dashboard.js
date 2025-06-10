import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  // Données simulées pour les graphiques (à remplacer par les vraies données)
  const monthlyObservations = [
    { month: 'Jan', observations: 45 },
    { month: 'Fév', observations: 52 },
    { month: 'Mar', observations: 38 },
    { month: 'Avr', observations: 67 },
    { month: 'Mai', observations: 73 },
    { month: 'Juin', observations: 85 }
  ];

  const conservationStatusData = [
    { name: 'Préoccupation mineure', value: 4, color: '#22c55e' },
    { name: 'Vulnérable', value: 3, color: '#f59e0b' },
    { name: 'En danger', value: 2, color: '#ef4444' },
    { name: 'En danger critique', value: 1, color: '#991b1b' }
  ];

  const topSpeciesData = stats?.species_observations?.slice(0, 5) || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord</h1>
        <p>Vue d'ensemble du suivi des espèces dans les parcs nationaux</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🦁</div>
          <div className="stat-content">
            <h3>Espèces suivies</h3>
            <div className="stat-number">{stats?.total_species || 0}</div>
            <div className="stat-change positive">+2 ce mois</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>Observations totales</h3>
            <div className="stat-number">{stats?.total_observations || 0}</div>
            <div className="stat-change positive">+{stats?.recent_observations || 0} récentes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>Alertes actives</h3>
            <div className="stat-number">3</div>
            <div className="stat-change negative">2 braconnage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Rangers actifs</h3>
            <div className="stat-number">12</div>
            <div className="stat-change neutral">8 en patrouille</div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        {/* Évolution des observations */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Évolution mensuelle des observations</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyObservations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="observations" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top espèces observées */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Espèces les plus observées</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSpeciesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="species" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statut de conservation */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Répartition par statut de conservation</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={conservationStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {conservationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="chart-card activity-feed">
          <div className="chart-header">
            <h3>Activités récentes</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🦁</div>
              <div className="activity-content">
                <div className="activity-title">Observation de lions</div>
                <div className="activity-details">3 individus observés dans le secteur Nord</div>
                <div className="activity-time">Il y a 2h</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🚨</div>
              <div className="activity-content">
                <div className="activity-title">Alerte braconnage</div>
                <div className="activity-details">Pièges détectés près du point d'eau #7</div>
                <div className="activity-time">Il y a 4h</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-content">
                <div className="activity-title">Rapport de patrouille</div>
                <div className="activity-details">Patrouille secteur Est terminée</div>
                <div className="activity-time">Il y a 6h</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🦒</div>
              <div className="activity-content">
                <div className="activity-title">Girafe photographiée</div>
                <div className="activity-details">Nouvelle observation avec coordonnées GPS</div>
                <div className="activity-time">Il y a 8h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <h3>Actions rapides</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <span className="action-icon">➕</span>
            Nouvelle observation
          </button>
          <button className="action-btn secondary">
            <span className="action-icon">📋</span>
            Créer patrouille
          </button>
          <button className="action-btn secondary">
            <span className="action-icon">📊</span>
            Générer rapport
          </button>
          <button className="action-btn secondary">
            <span className="action-icon">⚠️</span>
            Signaler incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;