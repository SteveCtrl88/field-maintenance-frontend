import apiService from './api'

class UserService {
  constructor() {
    this.currentUser = null
    this.loadUserFromStorage()
  }

  // Load user from localStorage on initialization
  loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
      this.currentUser = null
    }
  }

  // Save user to localStorage
  saveUserToStorage(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user))
      this.currentUser = user
    } catch (error) {
      console.error('Error saving user to storage:', error)
    }
  }

  // Clear user from localStorage
  clearUserFromStorage() {
    try {
      localStorage.removeItem('currentUser')
      this.currentUser = null
    } catch (error) {
      console.error('Error clearing user from storage:', error)
    }
  }

  // Authenticate user
  async authenticate(email, password) {
    try {
      const response = await apiService.request('/users/authenticate', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.success) {
        this.saveUserToStorage(response.data)
        return { success: true, user: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin'
  }

  // Check if user is technician
  isTechnician() {
    return this.currentUser && this.currentUser.role === 'technician'
  }

  // Logout user
  logout() {
    this.clearUserFromStorage()
  }

  // Setup admin user (for initial setup)
  async setupAdmin() {
    try {
      const response = await apiService.request('/users/setup-admin', {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Setup admin error:', error)
      return { success: false, error: 'Failed to setup admin' }
    }
  }

  // Get all users (admin only)
  async getUsers() {
    try {
      if (!this.isAdmin()) {
        return { success: false, error: 'Admin access required' }
      }

      const response = await apiService.request('/users')
      return response
    } catch (error) {
      console.error('Get users error:', error)
      return { success: false, error: 'Failed to get users' }
    }
  }

  // Create user (admin only)
  async createUser(userData) {
    try {
      if (!this.isAdmin()) {
        return { success: false, error: 'Admin access required' }
      }

      const response = await apiService.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      return response
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  // Update user (admin only)
  async updateUser(userId, userData) {
    try {
      if (!this.isAdmin()) {
        return { success: false, error: 'Admin access required' }
      }

      const response = await apiService.request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      })
      return response
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      if (!this.isAdmin()) {
        return { success: false, error: 'Admin access required' }
      }

      const response = await apiService.request(`/users/${userId}`, {
        method: 'DELETE'
      })
      return response
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }

  // Check permissions for inspection access
  canAccessInspection(inspection) {
    if (!this.currentUser) return false
    
    // Admins can access all inspections
    if (this.isAdmin()) return true
    
    // Technicians can only access their assigned inspections
    if (this.isTechnician()) {
      return inspection.technicianId === this.currentUser.id
    }
    
    return false
  }

  // Filter inspections based on user role
  filterInspectionsByRole(inspections) {
    if (!this.currentUser) return []
    
    // Admins see all inspections
    if (this.isAdmin()) return inspections
    
    // Technicians see only their assigned inspections
    if (this.isTechnician()) {
      return inspections.filter(inspection => 
        inspection.technicianId === this.currentUser.id
      )
    }
    
    return []
  }
}

// Create singleton instance
const userService = new UserService()

export default userService

