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

      // Try to load from API first
      let inspection = null
      try {
        const response = await apiService.getInspection(inspectionId)
        inspection = response.data || response
      } catch {
        console.log('API not available, checking localStorage')
      }

      // Fallback to localStorage if API fails
      if (!inspection) {
        const localInspections = JSON.parse(localStorage.getItem('scheduledInspections') || '[]')
        inspection = localInspections.find(i => i.id === inspectionId)
      }

      if (!inspection) {
        setError('Inspection not found')
        navigate('/dashboard')
        return
      }

      // Create robot object from inspection data
      const robotData = {
        id: inspection.robotSerial,
        serialNumber: inspection.robotSerial,
        model: inspection.robotModel,
        type: inspection.robotModel,
        customer: {
          id: inspection.customerId,
          name: inspection.customerName,
          address: inspection.customerAddress
        }
      }

      // Create session object
      const session = {
        id: inspection.id,
        robotId: inspection.robotSerial,
        technicianId: user.id,
        startTime: new Date(),
        responses: {},
        images: {},
        notes: {},
        status: 'in_progress',
        originalInspection: inspection
      }

      // Update inspection status to in_progress
      if (inspection.status === 'scheduled') {
        try {
          await apiService.updateInspection(inspectionId, {
            ...inspection,
            status: 'in_progress',
            startTime: new Date().toISOString(),
            progress: 0
          })
        } catch {
          console.log('Could not update inspection status via API')
        }
      }

      setCurrentRobot(robotData)
      setCurrentSession(session)

    } catch (error) {
      console.error('Error loading scheduled inspection:', error)
      setError('Failed to load inspection: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [user, navigate])

  useEffect(() => {
    const inspectionId = searchParams.get('edit')

    if (inspectionId && !maintenanceSession) {
      // Load scheduled inspection from API or localStorage
      loadScheduledInspection(inspectionId)
    }
  }, [searchParams, maintenanceSession, loadScheduledInspection])

  const handleSessionUpdate = (updatedSession) => {
    setCurrentSession(updatedSession)
    if (onSessionUpdate) {
      onSessionUpdate(updatedSession)
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
    navigate('/dashboard')
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
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!currentSession || !currentRobot) {
    navigate('/scan')
    return null
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

