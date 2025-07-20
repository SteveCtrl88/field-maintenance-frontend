// API Service Layer for Field Maintenance Application
// Handles all communication with the backend API

const API_BASE_URL = 'https://field-maintenance-backend-o5gmie85g-steve-pintos-projects.vercel.app/api/v1';

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
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User management endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Customer management endpoints
  async getCustomers() {
    return this.request('/customers');
  }

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(customerId, customerData) {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId) {
    return this.request(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  // Robot management endpoints (handled through customer updates)
  async getRobots() {
    // Get all robots from all customers
    try {
      const customers = await this.getCustomers();
      if (customers.success && customers.data) {
        const allRobots = [];
        customers.data.forEach(customer => {
          if (customer.robots && customer.robots.length > 0) {
            customer.robots.forEach(robot => {
              allRobots.push({
                ...robot,
                customer: {
                  _id: customer._id,
                  companyName: customer.companyName,
                  address: customer.address
                }
              });
            });
          }
        });
        return { success: true, data: allRobots };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error fetching robots:', error);
      return { success: false, data: [] };
    }
  }

  async createRobot(robotData) {
    // Add robot to customer via customer update
    try {
      const customer = await this.getCustomer(robotData.customerId);
      if (customer.success && customer.data) {
        const updatedCustomer = { ...customer.data };
        if (!updatedCustomer.robots) {
          updatedCustomer.robots = [];
        }
        
        // Create robot object with unique ID
        const newRobot = {
          _id: Date.now().toString(), // Temporary ID
          name: robotData.name,
          serialNumber: robotData.serialNumber,
          type: robotData.type,
          installationDate: robotData.installationDate,
          location: robotData.location,
          image: robotData.image || null,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        updatedCustomer.robots.push(newRobot);
        
        const result = await this.updateCustomer(robotData.customerId, updatedCustomer);
        if (result.success) {
          return { success: true, data: newRobot };
        }
      }
      return { success: false, message: 'Failed to create robot' };
    } catch (error) {
      console.error('Error creating robot:', error);
      return { success: false, message: 'Failed to create robot' };
    }
  }

  async updateRobot(robotId, robotData) {
    // Update robot in customer data
    try {
      const customers = await this.getCustomers();
      if (customers.success && customers.data) {
        for (const customer of customers.data) {
          if (customer.robots && customer.robots.length > 0) {
            const robotIndex = customer.robots.findIndex(robot => robot._id === robotId);
            if (robotIndex !== -1) {
              customer.robots[robotIndex] = { ...customer.robots[robotIndex], ...robotData };
              const result = await this.updateCustomer(customer._id, customer);
              if (result.success) {
                return { success: true, data: customer.robots[robotIndex] };
              }
            }
          }
        }
      }
      return { success: false, message: 'Robot not found' };
    } catch (error) {
      console.error('Error updating robot:', error);
      return { success: false, message: 'Failed to update robot' };
    }
  }

  async deleteRobot(robotId) {
    // Remove robot from customer data
    try {
      const customers = await this.getCustomers();
      if (customers.success && customers.data) {
        for (const customer of customers.data) {
          if (customer.robots && customer.robots.length > 0) {
            const robotIndex = customer.robots.findIndex(robot => robot._id === robotId);
            if (robotIndex !== -1) {
              customer.robots.splice(robotIndex, 1);
              const result = await this.updateCustomer(customer._id, customer);
              if (result.success) {
                return { success: true, message: 'Robot deleted successfully' };
              }
            }
          }
        }
      }
      return { success: false, message: 'Robot not found' };
    } catch (error) {
      console.error('Error deleting robot:', error);
      return { success: false, message: 'Failed to delete robot' };
    }
  }

  // Inspection endpoints
  async getInspections() {
    return this.request('/inspections');
  }

  async createInspection(inspectionData) {
    return this.request('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  async updateInspection(inspectionId, inspectionData) {
    return this.request(`/inspections/${inspectionId}`, {
      method: 'PUT',
      body: JSON.stringify(inspectionData),
    });
  }

  async getInspection(inspectionId) {
    return this.request(`/inspections/${inspectionId}`);
  }

  async deleteInspection(inspectionId) {
    return this.request(`/inspections/${inspectionId}`, {
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

    const response = await fetch(`${this.baseURL}/files/upload`, config);
    
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
    return this.request('/reports');
  }

  async generateReport(reportData) {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

