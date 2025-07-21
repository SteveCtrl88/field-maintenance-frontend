// Firebase Authentication Service
// Handles Firebase Auth integration for the frontend

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIbB5Q308o7aEkEZJVavnrWQ51JQpOvc0",
  authDomain: "field-maintenance.firebaseapp.com",
  databaseURL: "https://field-maintenance-default-rtdb.firebaseio.com",
  projectId: "field-maintenance",
  storageBucket: "field-maintenance.firebasestorage.app",
  messagingSenderId: "31273972276",
  appId: "1:31273972276:web:7400ea06e61980df52d061"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.currentUser = null;
    this.listeners = [];
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Get ID token
      const idToken = await getIdToken(user);
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: user.email === 'admin@company.com' ? 'admin' : 'user'
        },
        idToken: idToken
      };
    } catch (error) {
      console.error('Firebase sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error('Firebase sign out error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get ID token for current user
  async getIdToken() {
    if (!this.currentUser) {
      return null;
    }
    
    try {
      return await getIdToken(this.currentUser);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  // Add auth state listener
  addAuthStateListener(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
  }

  // Remove auth state listener
  removeAuthStateListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of auth state changes
  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Get user-friendly error message
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      default:
        return 'An error occurred during authentication.';
    }
  }
}

// Create and export a singleton instance
const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;

