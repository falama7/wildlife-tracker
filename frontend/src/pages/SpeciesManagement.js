import React, { useState, useEffect } from 'react';
import './SpeciesManagement.css';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const SpeciesManagement = () => {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    common_name: '',
    scientific_name: '',
    category: 'animal',
    conservation_status: 'LC',
    description: '',
    habitat_description: '',
    threats: '',
    conservation_actions: '',
    population_estimate: ''
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSpecies();
      setSpecies(data);
    } catch (err) {
      setError('Erreur lors du chargement des espèces');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModal = (speciesData = null) => {
    if (speciesData) {
      setEditingSpecies(speciesData.id);
      setFormData({
        common_name: speciesData.common_name || '',
        scientific_name: speciesData.scientific_name || '',
        category: speciesData.category || 'animal',
        conservation_status: speciesData.conservation_status || 'LC',
        description: speciesData.description || '',
        habitat_description: speciesData.habitat_description || '',
        threats: speciesData.threats || '',
        conservation_actions: speciesData.conservation_actions || '',
        population_estimate: speciesData.population_estimate || ''
      });
    } else {
      setEditingSpecies(null);
      setFormData({
        common_name: '',
        scientific_name: '',
        category: 'animal',
        conservation_status: 'LC',
        description: '',
        habitat_description: '',
        threats: '',
        conservation_actions: '',
        population_estimate: ''
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSpecies(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        population_estimate: formData.population_estimate ? parseInt(formData.population_estimate) : null
      };

      if (editingSpecies) {
        await apiService.updateSpecies(editingSpecies, submitData);
        setSuccess('Espèce mise à jour avec succès');
      } else {
        await apiService.createSpecies(submitData);
        setSuccess('Espèce créée avec succès');
      }

      closeModal();
      fetchSpecies();
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette espèce ?')) {
      return;
    }

    try {
      await apiService.deleteSpecies(id);
      setSuccess('Espèce supprimée avec succès');
      fetchSpecies();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await apiService.importSpeciesExcel(file);
      setSuccess(result.message);
      if (result.errors.length > 0) {
        setError(`Importé avec des erreurs: ${result.errors.join(', ')}`);
      }
      fetchSpecies();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'import');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'LC': '#22c55e',
      'NT': '#eab308',
      'VU': '#f59e0b',
      'EN': '#ef4444',
      'CR': '#991b1b',
      'EW': '#6b7280',
      'EX': '#374151'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'LC': 'Préoccupation mineure',
      'NT': 'Quasi menacé',
      'VU': 'Vulnérable',
      'EN': 'En danger',
      'CR': 'En danger critique',
      'EW': 'Éteint à l\'état sauvage',
      'EX': 'Éteint'
    };
    return labels[status] || status;
  };

  const getCategoryEmoji = (category) => {
    return category === 'animal' ? '🦁' : '🌳';
  };

  const filteredSpecies = species.filter(s => {
    const matchesSearch = s.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.scientific_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || s.conservation_status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && species.length === 0) return <LoadingSpinner />;

  return (
    <div className="species-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestion des Espèces</h1>
          <p>Gérez les espèces suivies dans les parcs nationaux</p>
        </div>
        <div className="header-actions">
          <label className="import-btn">
            📥 Importer Excel
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={() => openModal()} className="add-btn">
            ➕ Nouvelle espèce
          </button>
        </div>
      </div>

      {/* Messages de notification */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Toutes catégories</option>
            <option value="animal">Animaux</option>
            <option value="plant">Plantes</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous statuts</option>
            <option value="LC">Préoccupation mineure</option>
            <option value="NT">Quasi menacé</option>
            <option value="VU">Vulnérable</option>
            <option value="EN">En danger</option>
            <option value="CR">En danger critique</option>
          </select>
        </div>
        
        <div className="results-count">
          {filteredSpecies.length} espèce(s) trouvée(s)
        </div>
      </div>

      {/* Liste des espèces */}
      <div className="species-grid">
        {filteredSpecies.map(s => (
          <div key={s.id} className="species-card">
            <div className="card-header">
              <div className="species-icon">
                {getCategoryEmoji(s.category)}
              </div>
              <div className="species-info">
                <h3>{s.common_name}</h3>
                <p className="scientific-name">{s.scientific_name}</p>
              </div>
              <div className="card-actions">
                <button onClick={() => openModal(s)} className="edit-btn">
                  ✏️
                </button>
                <button onClick={() => handleDelete(s.id)} className="delete-btn">
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <div className="status-badge" style={{ backgroundColor: getStatusColor(s.conservation_status) }}>
                {getStatusLabel(s.conservation_status)}
              </div>
              
              {s.description && (
                <p className="description">{s.description.substring(0, 100)}...</p>
              )}
              
              <div className="species-stats">
                <div className="stat">
                  <span className="stat-label">Catégorie:</span>
                  <span className="stat-value">{s.category === 'animal' ? 'Animal' : 'Plante'}</span>
                </div>
                {s.population_estimate && (
                  <div className="stat">
                    <span className="stat-label">Population estimée:</span>
                    <span className="stat-value">{s.population_estimate.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSpecies ? 'Modifier l\'espèce' : 'Nouvelle espèce'}</h2>
              <button onClick={closeModal} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom commun *</label>
                  <input
                    type="text"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Nom scientifique *</label>
                  <input
                    type="text"
                    name="scientific_name"
                    value={formData.scientific_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="animal">Animal</option>
                    <option value="plant">Plante</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Statut de conservation</label>
                  <select name="conservation_status" value={formData.conservation_status} onChange={handleInputChange}>
                    <option value="LC">Préoccupation mineure</option>
                    <option value="NT">Quasi menacé</option>
                    <option value="VU">Vulnérable</option>
                    <option value="EN">En danger</option>
                    <option value="CR">En danger critique</option>
                    <option value="EW">Éteint à l'état sauvage</option>
                    <option value="EX">Éteint</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Population estimée</label>
                <input
                  type="number"
                  name="population_estimate"
                  value={formData.population_estimate}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Description générale de l'espèce..."
                />
              </div>
              
              <div className="form-group">
                <label>Description de l'habitat</label>
                <textarea
                  name="habitat_description"
                  value={formData.habitat_description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Habitat naturel et besoins écologiques..."
                />
              </div>
              
              <div className="form-group">
                <label>Menaces identifiées</label>
                <textarea
                  name="threats"
                  value={formData.threats}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Principales menaces pesant sur l'espèce..."
                />
              </div>
              
              <div className="form-group">
                <label>Actions de conservation</label>
                <textarea
                  name="conservation_actions"
                  value={formData.conservation_actions}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Mesures de conservation en place ou prévues..."
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Annuler
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Sauvegarde...' : editingSpecies ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesManagement;