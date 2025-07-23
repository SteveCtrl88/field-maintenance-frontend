import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import QRScanner from './components/QRScanner'
import RobotConfirmation from './components/RobotConfirmation'
import MaintenanceHandler from './components/MaintenanceHandler'
import CompletionScreen from './components/CompletionScreen'
import CustomerManagement from './components/CustomerManagement'
import CustomerDetails from './components/CustomerDetails'
import CustomerForm from './components/CustomerForm'
import RobotTypes from './components/RobotTypes'
import Reports from './components/Reports'
import authService from './services/auth.js'
import firebaseAuthService from './services/firebase.js'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [scannedRobot, setScannedRobot] = useState(null)
  const [maintenanceSession, setMaintenanceSession] = useState(null)

  // Initialize Firebase Auth and listen for auth state changes
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Initializing Firebase Auth...')
    }
    
    // Make Firebase services available globally for debugging
    if (import.meta.env.DEV) {
      window.firebaseAuthService = firebaseAuthService
      window.authService = authService
    }
    
    // Listen for auth state changes
    const unsubscribe = authService.addListener((authState) => {
      if (import.meta.env.DEV) {
        console.log('Auth state changed:', authState)
      }
      setIsAuthenticated(authState.isAuthenticated)
      setCurrentUser(authState.user)
    })

    return () => {
      if (unsubscribe) {
        authService.removeListener(unsubscribe);
      }
    };
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true)
    setCurrentUser(user)
  }

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false)
    setCurrentUser(null)
    setScannedRobot(null)
    setMaintenanceSession(null)
  }

  const handleRobotScanned = (robotData) => {
    setScannedRobot(robotData)
  }

  const handleRobotConfirmed = () => {
    // Initialize maintenance session
    const session = {
      id: Date.now().toString(),
      robotId: scannedRobot.id,
      technicianId: currentUser.id,
      startTime: new Date(),
      responses: {},
      images: {},
      status: 'in_progress'
    }
    setMaintenanceSession(session)
  }

  const handleSessionUpdate = (updatedSession) => {
    setMaintenanceSession(updatedSession)
  }

  const handleSessionComplete = () => {
    setMaintenanceSession(prev => ({
      ...prev,
      status: 'completed',
      endTime: new Date()
    }))
  }

  const handleNewMaintenance = () => {
    setScannedRobot(null)
    setMaintenanceSession(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? 
                <LoginScreen onLogin={handleLogin} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard 
                  user={currentUser} 
                  onLogout={handleLogout}
                  onNewMaintenance={handleNewMaintenance}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/scan" 
            element={
              isAuthenticated ? 
                <QRScanner 
                  onRobotScanned={handleRobotScanned}
                  user={currentUser}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/confirm-robot" 
            element={
              isAuthenticated && scannedRobot ? 
                <RobotConfirmation 
                  robot={scannedRobot}
                  onConfirm={handleRobotConfirmed}
                  user={currentUser}
                /> : 
                <Navigate to="/scan" replace />
            } 
          />
          <Route 
            path="/maintenance" 
            element={
              isAuthenticated ? 
                <MaintenanceHandler 
                  maintenanceSession={maintenanceSession}
                  scannedRobot={scannedRobot}
                  user={currentUser}
                  onSessionUpdate={handleSessionUpdate}
                  onComplete={handleSessionComplete}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/complete" 
            element={
              isAuthenticated && maintenanceSession?.status === 'completed' ? 
                <CompletionScreen 
                  session={maintenanceSession}
                  robot={scannedRobot}
                  user={currentUser}
                  onNewMaintenance={handleNewMaintenance}
                /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/customers" 
            element={
              isAuthenticated ? 
                <CustomerManagement 
                  user={currentUser}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/customers/new" 
            element={
              isAuthenticated ? 
                <CustomerForm 
                  user={currentUser}
                  mode="create"
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/customers/:id" 
            element={
              isAuthenticated ? 
                <CustomerDetails 
                  user={currentUser}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/customers/:id/edit" 
            element={
              isAuthenticated ? 
                <CustomerForm 
                  user={currentUser}
                  mode="edit"
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/robots" 
            element={
              isAuthenticated ? 
                <RobotTypes 
                  user={currentUser}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/robot-types" 
            element={
              isAuthenticated ? 
                <RobotTypes 
                  user={currentUser}
                /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute adminOnly={true}>
                <UserManagement user={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              isAuthenticated && currentUser?.role === 'admin' ? 
                <Reports 
                  user={currentUser}
                /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

