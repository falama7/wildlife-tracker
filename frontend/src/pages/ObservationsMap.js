import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './ObservationsMap.css';
import { apiService } from '../services/apiService';

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Icônes personnalisées pour différents types d'observations
const createCustomIcon = (species, color = '#3388ff') => {
  const emoji = getSpeciesEmoji(species);
  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: ${color};">${emoji}</div>`,
    className: 'custom-marker-container',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
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

const getConservationColor = (status) => {
  const colorMap = {
    'LC': '#22c55e', // Vert - Préoccupation mineure
    'NT': '#eab308', // Jaune - Quasi menacé
    'VU': '#f59e0b', // Orange - Vulnérable
    'EN': '#ef4444', // Rouge - En danger
    'CR': '#991b1b', // Rouge foncé - En danger critique
    'EW': '#6b7280', // Gris - Éteint à l'état sauvage
    'EX': '#374151'  // Gris foncé - Éteint
  };
  return colorMap[status] || '#3388ff';
};

const ObservationsMap = () => {
  const [observations, setObservations] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [mapCenter] = useState([9.3, 13.4]); // Région du Nord Cameroun
  const [mapZoom] = useState(8);
  const mapRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [observationsData, speciesData] = await Promise.all([
          apiService.getObservationsGeoJSON(selectedSpecies !== 'all' ? selectedSpecies : null),
          apiService.getSpecies()
        ]);
        
        setObservations(observationsData.features || []);
        setSpecies(speciesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSpecies]);

  const handleSpeciesChange = (e) => {
    setSelectedSpecies(e.target.value);
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const filteredObservations = observations.filter(obs => {
    const obsDate = new Date(obs.properties.observation_date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    if (startDate && obsDate < startDate) return false;
    if (endDate && obsDate > endDate) return false;
    
    return true;
  });

  const renderObservationMarkers = () => {
    return filteredObservations.map((observation) => {
      const { coordinates } = observation.geometry;
      const props = observation.properties;
      const speciesData = species.find(s => s.id === props.species_id);
      
      const icon = createCustomIcon(
        props.species_name,
        getConservationColor(speciesData?.conservation_status)
      );

      return (
        <Marker
          key={observation.properties.id}
          position={[coordinates[1], coordinates[0]]}
          icon={icon}
        >
          <Popup className="observation-popup">
            <div className="popup-content">
              <h4>{props.species_name}</h4>
              <div className="popup-details">
                <p><strong>Nombre:</strong> {props.count} individu(s)</p>
                <p><strong>Date:</strong> {new Date(props.observation_date).toLocaleDateString()}</p>
                <p><strong>Activité:</strong> {props.activity_type || 'Non spécifiée'}</p>
                {props.notes && <p><strong>Notes:</strong> {props.notes}</p>}
                {speciesData && (
                  <p><strong>Statut:</strong> 
                    <span className={`status-badge ${speciesData.conservation_status.toLowerCase()}`}>
                      {speciesData.conservation_status}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="observations-map-page">
      {/* Panneau de contrôle */}
      <div className="map-controls">
        <div className="controls-header">
          <h2>Cartographie des Observations</h2>
          <div className="controls-stats">
            {loading ? (
              <span>Chargement...</span>
            ) : (
              <span>{filteredObservations.length} observation(s) affichée(s)</span>
            )}
          </div>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label>Espèce:</label>
            <select value={selectedSpecies} onChange={handleSpeciesChange}>
              <option value="all">Toutes les espèces</option>
              {species.map(spec => (
                <option key={spec.id} value={spec.id}>
                  {spec.common_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Période:</label>
            <div className="date-range">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                placeholder="Date début"
              />
              <span>à</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                placeholder="Date fin"
              />
            </div>
          </div>
          
          <button className="refresh-btn" onClick={() => window.location.reload()}>
            🔄 Actualiser
          </button>
        </div>

        {/* Légende */}
        <div className="map-legend">
          <h4>Légende - Statut de conservation</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#22c55e'}}></span>
              <span>LC - Préoccupation mineure</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#eab308'}}></span>
              <span>NT - Quasi menacé</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#f59e0b'}}></span>
              <span>VU - Vulnérable</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#ef4444'}}></span>
              <span>EN - En danger</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{backgroundColor: '#991b1b'}}></span>
              <span>CR - En danger critique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Observations">
              <FeatureGroup>
                {!loading && renderObservationMarkers()}
              </FeatureGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {/* Contrôles de dessin pour les zones d'intérêt */}
          <FeatureGroup>
            <EditControl
              position="topright"
              draw={{
                rectangle: true,
                polygon: true,
                circle: true,
                marker: false,
                circlemarker: false,
                polyline: false
              }}
              edit={{
                edit: true,
                remove: true
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default ObservationsMap;