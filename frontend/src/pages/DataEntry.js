import React, { useState, useEffect } from 'react';
import './DataEntry.css';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const DataEntry = () => {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    species_id: '',
    latitude: '',
    longitude: '',
    observation_date: new Date().toISOString().split('T')[0],
    count: 1,
    activity_type: '',
    weather_conditions: '',
    temperature: '',
    humidity: '',
    behavior_notes: '',
    health_status: '',
    age_group: '',
    sex: '',
    notes: ''
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      const data = await apiService.getSpecies();
      setSpecies(data);
    } catch (err) {
      setError('Erreur lors du chargement des espèces');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        }));
        setCurrentLocation({ latitude, longitude });
        setLocationLoading(false);
        setSuccess('Position GPS obtenue avec succès');
      },
      (error) => {
        setError('Erreur lors de l\'obtention de la position GPS');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const validateForm = () => {
    if (!formData.species_id) {
      setError('Veuillez sélectionner une espèce');
      return false;
    }
    
    if (!formData.latitude || !formData.longitude) {
      setError('Les coordonnées GPS sont obligatoires');
      return false;
    }
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude invalide (doit être entre -90 et 90)');
      return false;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Longitude invalide (doit être entre -180 et 180)');
      return false;
    }
    
    if (formData.count < 1) {
      setError('Le nombre d\'individus doit être supérieur à 0');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        species_id: parseInt(formData.species_id),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        count: parseInt(formData.count),
        observation_date: new Date(formData.observation_date + 'T12:00:00').toISOString(),
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        humidity: formData.humidity ? parseFloat(formData.humidity) : null
      };

      await apiService.createObservation(submitData);
      setSuccess('Observation enregistrée avec succès !');
      
      // Reset form
      setFormData({
        species_id: '',
        latitude: '',
        longitude: '',
        observation_date: new Date().toISOString().split('T')[0],
        count: 1,
        activity_type: '',
        weather_conditions: '',
        temperature: '',
        humidity: '',
        behavior_notes: '',
        health_status: '',
        age_group: '',
        sex: '',
        notes: ''
      });
      
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (speciesName) => {
    const emojiMap = {
      'Lion': '🦁',
      'Girafe du Kordofan': '🦒',
      'Éléphant de savane': '🐘',
      'Eland de Derby': '🦌',
      'Hippopotame': '🦛',
      'Autruche d\'Afrique': '🦅',
      'Crocodile du Nil': '🐊',
      'Acadjou d\'Afrique': '🌳',
      'Dattier du désert': '🌴',
      'Acacia rouge': '🌲'
    };
    return emojiMap[speciesName] || '📍';
  };

  return (
    <div className="data-entry">
      <div className="page-header">
        <h1>Saisie d'Observation</h1>
        <p>Enregistrez vos observations de terrain</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="entry-container">
        <form onSubmit={handleSubmit} className="observation-form">
          {/* Section identification */}
          <div className="form-section">
            <h3>🔍 Identification</h3>
            
            <div className="form-group">
              <label>Espèce observée *</label>
              <select
                name="species_id"
                value={formData.species_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez une espèce...</option>
                {species.map(s => (
                  <option key={s.id} value={s.id}>
                    {getSpeciesEmoji(s.common_name)} {s.common_name} ({s.scientific_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre d'individus *</label>
                <input
                  type="number"
                  name="count"
                  value={formData.count}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date d'observation *</label>
                <input
                  type="date"
                  name="observation_date"
                  value={formData.observation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section géolocalisation */}
          <div className="form-section">
            <h3>📍 Géolocalisation</h3>
            
            <div className="location-controls">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="gps-btn"
              >
                {locationLoading ? (
                  <>🔄 Obtention GPS...</>
                ) : (
                  <>🛰️ Obtenir position GPS</>
                )}
              </button>
              
              {currentLocation && (
                <div className="location-info">
                  Position obtenue avec précision
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Latitude *</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="Ex: 9.308946"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Longitude *</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="Ex: 13.402548"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section détails biologiques */}
          <div className="form-section">
            <h3>🧬 Détails biologiques</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Classe d'âge</label>
                <select name="age_group" value={formData.age_group} onChange={handleInputChange}>
                  <option value="">Non spécifié</option>
                  <option value="adult">Adulte</option>
                  <option value="juvenile">Juvénile</option>
                  <option value="infant">Petit/Nouveau-né</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Sexe</label>
                <select name="sex" value={formData.sex} onChange={handleInputChange}>
                  <option value="">Non déterminé</option>
                  <option value="male">Mâle</option>
                  <option value="female">Femelle</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>État de santé apparent</label>
              <select name="health_status" value={formData.health_status} onChange={handleInputChange}>
                <option value="">Non évalué</option>
                <option value="excellent">Excellent</option>
                <option value="good">Bon</option>
                <option value="fair">Moyen</option>
                <option value="poor">Mauvais</option>
                <option value="injured">Blessé</option>
                <option value="sick">Malade</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Comportement observé</label>
              <textarea
                name="behavior_notes"
                value={formData.behavior_notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Décrivez le comportement observé, les interactions, l'activité..."
              />
            </div>
          </div>

          {/* Section contexte environnemental */}
          <div className="form-section">
            <h3>🌤️ Contexte environnemental</h3>
            
            <div className="form-group">
              <label>Type d'activité</label>
              <select name="activity_type" value={formData.activity_type} onChange={handleInputChange}>
                <option value="">Sélectionnez...</option>
                <option value="suivi_populations">Suivi des populations</option>
                <option value="lutte_braconnage">Lutte anti-braconnage</option>
                <option value="gestion_habitat">Gestion de l'habitat</option>
                <option value="implication_communautes">Implication communautés</option>
                <option value="restauration">Restauration</option>
                <option value="recherche">Recherche</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Conditions météorologiques</label>
              <select name="weather_conditions" value={formData.weather_conditions} onChange={handleInputChange}>
                <option value="">Non spécifié</option>
                <option value="sunny">Ensoleillé</option>
                <option value="cloudy">Nuageux</option>
                <option value="rainy">Pluvieux</option>
                <option value="stormy">Orageux</option>
                <option value="windy">Venteux</option>
                <option value="foggy">Brumeux</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Température (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  placeholder="Ex: 28.5"
                />
              </div>
              
              <div className="form-group">
                <label>Humidité (%)</label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  placeholder="Ex: 65"
                />
              </div>
            </div>
          </div>

          {/* Section notes additionnelles */}
          <div className="form-section">
            <h3>📝 Notes additionnelles</h3>
            
            <div className="form-group">
              <label>Observations complémentaires</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Informations supplémentaires, contexte particulier, autres espèces présentes..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="reset-btn" onClick={() => {
              setFormData({
                species_id: '',
                latitude: '',
                longitude: '',
                observation_date: new Date().toISOString().split('T')[0],
                count: 1,
                activity_type: '',
                weather_conditions: '',
                temperature: '',
                humidity: '',
                behavior_notes: '',
                health_status: '',
                age_group: '',
                sex: '',
                notes: ''
              });
            }}>
              🔄 Réinitialiser
            </button>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>⏳ Enregistrement...</>
              ) : (
                <>💾 Enregistrer l'observation</>
              )}
            </button>
          </div>
        </form>

        {/* Aide et conseils */}
        <div className="help-panel">
          <h3>💡 Conseils de saisie</h3>
          
          <div className="help-section">
            <h4>📍 Géolocalisation</h4>
            <ul>
              <li>Utilisez le bouton GPS pour obtenir votre position actuelle</li>
              <li>Assurez-vous d'être proche du lieu d'observation</li>
              <li>Vérifiez la précision des coordonnées</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>🔍 Identification</h4>
            <ul>
              <li>Soyez certain de l'identification de l'espèce</li>
              <li>En cas de doute, notez-le dans les observations</li>
              <li>Comptez avec précision le nombre d'individus</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>📝 Documentation</h4>
            <ul>
              <li>Décrivez précisément le comportement observé</li>
              <li>Notez les conditions environnementales</li>
              <li>Mentionnez tout élément inhabituel</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>⚠️ Sécurité</h4>
            <ul>
              <li>Maintenez une distance de sécurité</li>
              <li>Ne dérangez pas les animaux</li>
              <li>Respectez les protocoles du parc</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;