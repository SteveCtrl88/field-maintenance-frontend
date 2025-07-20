// Authentication Service
// Handles user authentication state and JWT token management

import apiService from './api.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.listeners = [];
    
    // Initialize authentication state
    this.initializeAuth();
  }

  // Initialize authentication state from stored token
  async initializeAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Verify token is still valid by getting current user
        const user = await apiService.getCurrentUser();
        this.setUser(user);
      } catch (error) {
        console.error('Token validation failed:', error);
        this.logout();
      }
    }
  }

  // Set current user and update authentication state
  setUser(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.notifyListeners();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Check if user has admin role
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  // Check if user has technician role
  isTechnician() {
    return this.currentUser && this.currentUser.role === 'technician';
  }

  // Login user
  async login(email, password) {
    try {
      const response = await apiService.login(email, password);
      
      if (response.user) {
        this.setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error('Login failed: No user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo authentication if API fails
      return this.fallbackLogin(email, password);
    }
  }

  // Fallback authentication for demo users
  fallbackLogin(email, password) {
    const demoUsers = {
      'admin@company.com': {
        id: 'demo-admin-1',
        name: 'System Administrator',
        email: 'admin@company.com',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        profile: {
          phone: '(555) 123-4567',
          department: 'Administration'
        }
      },
      'tech@company.com': {
        id: 'demo-tech-1',
        name: 'Field Technician',
        email: 'tech@company.com',
        role: 'technician',
        isActive: true,
        lastLogin: new Date().toISOString(),
        profile: {
          phone: '(555) 987-6543',
          department: 'Field Operations'
        }
      }
    };

    const user = demoUsers[email.toLowerCase()];
    if (user && password === 'password123') {
      // Create a demo JWT token
      const demoToken = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }));
      
      localStorage.setItem('authToken', demoToken);
      this.setUser(user);
      
      console.log('Demo authentication successful for:', email);
      return { success: true, user: user };
    }

    return { 
      success: false, 
      error: 'Invalid credentials. Please use the demo credentials shown below the login form.' 
    };
  }

  // Register new user
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('authToken');
      this.notifyListeners();
    }
  }

  // Add authentication state listener
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remove authentication state listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of authentication state changes
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          isAuthenticated: this.isAuthenticated,
          user: this.currentUser
        });
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  // Get user display name
  getUserDisplayName() {
    if (!this.currentUser) return 'Guest';
    return this.currentUser.name || this.currentUser.email || 'User';
  }

  // Get user role display
  getUserRole() {
    if (!this.currentUser) return '';
    return this.currentUser.role || 'user';
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    const token = localStorage.getItem('authToken');
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Refresh authentication state
  async refreshAuth() {
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    try {
      const user = await apiService.getCurrentUser();
      this.setUser(user);
      return true;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      this.logout();
      return false;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

