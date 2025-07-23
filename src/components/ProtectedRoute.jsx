import { Navigate } from 'react-router-dom'
import userService from '../services/userService'

const ProtectedRoute = ({ children, adminOnly = false, requireAuth = true }) => {
  const isAuthenticated = userService.isAuthenticated()
  const isAdmin = userService.isAdmin()
  const currentUser = userService.getCurrentUser()

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If admin access is required but user is not admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // If user is authenticated but doesn't have a valid role
  if (isAuthenticated && currentUser && !['admin', 'technician'].includes(currentUser.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

