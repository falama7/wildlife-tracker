const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

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

  // Espèces
  async getSpecies(skip = 0, limit = 100) {
    return this.request(`/species?skip=${skip}&limit=${limit}`);
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

  // Observations
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

  // Statistiques
  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  // Import Excel
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
}

export const apiService = new ApiService();
