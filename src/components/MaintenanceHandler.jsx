import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MaintenanceChecklist from './MaintenanceChecklist'
import apiService from '../services/api'

const MaintenanceHandler = ({ maintenanceSession, scannedRobot, user, onSessionUpdate, onComplete }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentSession, setCurrentSession] = useState(maintenanceSession)
  const [currentRobot, setCurrentRobot] = useState(scannedRobot)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadScheduledInspection = useCallback(async (inspectionId) => {
    try {
      setLoading(true)
      setError('')

      // Try to load from localStorage first
      const scheduledInspections = JSON.parse(localStorage.getItem('scheduledInspections') || '[]')
      const inspection = scheduledInspections.find(insp => insp.id === inspectionId)

      if (inspection) {
        // Convert scheduled inspection to maintenance session format
        const session = {
          id: inspection.id,
          robotId: inspection.robotId,
          technicianId: inspection.technicianId,
          customerId: inspection.customerId,
          startTime: new Date(),
          responses: {},
          images: {},
          notes: {},
          status: 'in_progress'
        }

        // Load robot data
        const robots = JSON.parse(localStorage.getItem('robots') || '[]')
        const robot = robots.find(r => r.id === inspection.robotId)

        setCurrentSession(session)
        setCurrentRobot(robot || { id: inspection.robotId, name: 'Unknown Robot' })
      } else {
        setError('Inspection not found')
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    } catch (error) {
      console.error('Error loading scheduled inspection:', error)
      setError('Failed to load inspection')
      setTimeout(() => navigate('/dashboard'), 2000)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const inspectionId = searchParams.get('inspectionId') || searchParams.get('edit')

    if (inspectionId && !maintenanceSession) {
      // Load scheduled inspection from localStorage
      loadScheduledInspection(inspectionId)
    } else if (!maintenanceSession && !scannedRobot) {
      // No session or robot data, redirect to dashboard
      navigate('/dashboard')
    }
  }, [searchParams, maintenanceSession, scannedRobot, loadScheduledInspection, navigate])

  const handleSessionUpdate = (updatedSession) => {
    setCurrentSession(updatedSession)
    if (onSessionUpdate) {
      onSessionUpdate(updatedSession)
    }
  }

  const handleComplete = (completedSession) => {
    if (onComplete) {
      onComplete(completedSession)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inspection</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentSession || !currentRobot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No inspection data available</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <MaintenanceChecklist
      session={currentSession}
      robot={currentRobot}
      user={user}
      onSessionUpdate={handleSessionUpdate}
      onComplete={handleComplete}
    />
  )
}

export default MaintenanceHandler

