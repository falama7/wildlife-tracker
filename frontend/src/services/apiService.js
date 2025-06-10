const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Méthode utilitaire pour obtenir les headers avec authentification
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Méthode utilitaire pour les requêtes HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // === MÉTHODES ESPÈCES ===
  
  async getSpecies(skip = 0, limit = 100) {
    return this.request(`/species?skip=${skip}&limit=${limit}`);
  }

  async getSpeciesById(id) {
    return this.request(`/species/${id}`);
  }

  async createSpecies(speciesData) {
    return this.request('/species', {
      method: 'POST',
      body: JSON.stringify(speciesData),
    });
  }

  async updateSpecies(id, speciesData) {
    return this.request(`/species/${id}`, {
      method: 'PUT',
      body: JSON.stringify(speciesData),
    });
  }

  async deleteSpecies(id) {
    return this.request(`/species/${id}`, {
      method: 'DELETE',
    });
  }

  async importSpeciesExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/species/import-excel`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de l\'import');
    }

    return await response.json();
  }

  // === MÉTHODES OBSERVATIONS ===
  
  async getObservations(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/observations${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getObservationsGeoJSON(speciesId = null) {
    const endpoint = `/observations/geojson${speciesId ? `?species_id=${speciesId}` : ''}`;
    return this.request(endpoint);
  }

  async createObservation(observationData) {
    return this.request('/observations', {
      method: 'POST',
      body: JSON.stringify(observationData),
    });
  }

  async updateObservation(id, observationData) {
    return this.request(`/observations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(observationData),
    });
  }

  async deleteObservation(id) {
    return this.request(`/observations/${id}`, {
      method: 'DELETE',
    });
  }

  // === MÉTHODES STATISTIQUES ===
  
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  async getSpeciesStatistics(speciesId) {
    return this.request(`/stats/species/${speciesId}`);
  }

  // === MÉTHODES UTILISATEURS ===
  
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // === MÉTHODES ACTIVITÉS ===
  
  async getActivities(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    const endpoint = `/activities${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async createActivity(activityData) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateActivity(id, activityData) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  // === MÉTHODES EXPORT ===
  
  async exportObservations(format = 'csv', filters = {}) {
    const params = new URLSearchParams();
    params.append('format', format);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${this.baseURL}/export/observations?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }
    
    return response.blob();
  }

  async exportSpecies(format = 'csv') {
    const response = await fetch(`${this.baseURL}/export/species?format=${format}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }
    
    return response.blob();
  }

  // === MÉTHODES UPLOAD ===
  
  async uploadFile(file, type = 'observation') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur lors de l\'upload');
    }

    return await response.json();
  }
}

// ===== SERVICE D'AUTHENTIFICATION =====

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erreur de connexion');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    
    return data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Aucun token trouvé');
    }

    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error('Erreur lors de la récupération du profil utilisateur');
    }

    return await response.json();
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

// ===== UTILITAIRES =====

class UtilsService {
  // Formatter les coordonnées GPS
  static formatCoordinates(lat, lng, precision = 6) {
    return {
      latitude: parseFloat(lat).toFixed(precision),
      longitude: parseFloat(lng).toFixed(precision),
    };
  }

  // Calculer la distance entre deux points GPS
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Valider les coordonnées GPS
  static validateCoordinates(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return { valid: false, error: 'Coordonnées invalides' };
    }
    
    if (latitude < -90 || latitude > 90) {
      return { valid: false, error: 'Latitude doit être entre -90 et 90' };
    }
    
    if (longitude < -180 || longitude > 180) {
      return { valid: false, error: 'Longitude doit être entre -180 et 180' };
    }
    
    return { valid: true };
  }

  // Formatter les dates
  static formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
  }

  // Télécharger un fichier blob
  static downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Instances des services
export const apiService = new ApiService();
export const authService = new AuthService();
export const utilsService = UtilsService;