// API Service Layer for Field Maintenance Application
// Handles all communication with the backend API

const API_BASE_URL = 'https://field-maintenance-backend-o5gmie85g-steve-pintos-projects.vercel.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  // Make authenticated API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like health check)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } else {
        // For non-JSON responses, return the text
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return { message: text };
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // User management endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Customer management endpoints
  async getCustomers() {
    return this.request('/api/customers');
  }

  async createCustomer(customerData) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(customerId, customerData) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  // Robot management endpoints
  async getRobots() {
    return this.request('/api/robots');
  }

  async createRobot(robotData) {
    return this.request('/api/robots', {
      method: 'POST',
      body: JSON.stringify(robotData),
    });
  }

  async updateRobot(robotId, robotData) {
    return this.request(`/api/robots/${robotId}`, {
      method: 'PUT',
      body: JSON.stringify(robotData),
    });
  }

  async deleteRobot(robotId) {
    return this.request(`/api/robots/${robotId}`, {
      method: 'DELETE',
    });
  }

  // Inspection endpoints
  async getInspections() {
    return this.request('/api/inspections');
  }

  async createInspection(inspectionData) {
    return this.request('/api/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  async updateInspection(inspectionId, inspectionData) {
    return this.request(`/api/inspections/${inspectionId}`, {
      method: 'PUT',
      body: JSON.stringify(inspectionData),
    });
  }

  async getInspection(inspectionId) {
    return this.request(`/api/inspections/${inspectionId}`);
  }

  async deleteInspection(inspectionId) {
    return this.request(`/api/inspections/${inspectionId}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoints
  async uploadFile(file, inspectionId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('inspectionId', inspectionId);

    const token = this.getToken();
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/api/files/upload`, config);
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Reports endpoints
  async getReports() {
    return this.request('/api/reports');
  }

  async generateReport(reportData) {
    return this.request('/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

