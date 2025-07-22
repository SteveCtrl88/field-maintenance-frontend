// Authentication Service
// Handles user authentication state and Firebase Auth integration

import apiService from './api.js';
import firebaseAuthService from './firebase.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.listeners = [];
    
    // Initialize authentication state
    this.initializeAuth();
  }

  // Initialize authentication state from Firebase Auth
  async initializeAuth() {
    // Listen for Firebase Auth state changes
    firebaseAuthService.addAuthStateListener((user) => {
      if (user) {
        // User is signed in
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: user.email === 'admin@company.com' ? 'admin' : 'user'
        };
        this.setUser(userData);
      } else {
        // User is signed out
        this.currentUser = null;
        this.isAuthenticated = false;
        this.notifyListeners();
      }
    });
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

  // Login user with Firebase Auth
  async login(email, password) {
    try {
      // Use Firebase Auth for authentication
      const result = await firebaseAuthService.signIn(email, password);
      
      if (result.success) {
        // Send ID token to backend for validation
        try {
          const backendResponse = await apiService.login('', '', result.idToken);
          console.log('Backend validation successful:', backendResponse);
        } catch (backendError) {
          console.warn('Backend validation failed, but Firebase auth succeeded:', backendError);
          // Continue with Firebase auth even if backend fails
        }
        
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please check your credentials and try again.' 
      };
    }
  }

  // Register new user (not implemented for Firebase Auth)
  async register() {
    return { 
      success: false, 
      error: 'Registration is not available. Please contact an administrator.' 
    };
  }

  // Logout user
  async logout() {
    try {
      await firebaseAuthService.signOut();
      this.currentUser = null;
      this.isAuthenticated = false;
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
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

  // Get Firebase ID token for API requests
  async getIdToken() {
    return await firebaseAuthService.getIdToken();
  }

  // Refresh authentication state
  async refreshAuth() {
    // Firebase Auth handles token refresh automatically
    return this.isUserAuthenticated();
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

