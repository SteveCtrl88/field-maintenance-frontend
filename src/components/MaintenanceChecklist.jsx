/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Plus,
  Camera,
  FileText,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Settings
} from 'lucide-react'
import apiService from '../services/api'

const MaintenanceChecklist = ({ session, robot, user, onSessionUpdate, onComplete }) => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState(session?.responses || {})
  const [images, setImages] = useState(session?.images || {})
  const [notes, setNotes] = useState(session?.notes || {})
  const [showChoiceModal, setShowChoiceModal] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showFullScreenCamera, setShowFullScreenCamera] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [isCapturingImage, setIsCapturingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)

  // Define all maintenance questions
  const questions = [
    {
      id: 'display_working',
      title: 'Display Check',
      question: 'Is the display on and in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'robot_charging',
      title: 'Charging System',
      question: 'Is the robot charging properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'charger_working',
      title: 'Charger Check',
      question: 'Is the charger working correctly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'damage_check',
      title: 'Damage Assessment',
      question: 'Is there any damage?',
      type: 'yes_no_plus',
      required: true,
      imageRequired: 'conditional' // Required if answer is "yes"
    },
    {
      id: 'door_1',
      title: 'Door 1 Check',
      question: 'Is door 1 functioning properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_2',
      title: 'Door 2 Check',
      question: 'Is door 2 functioning properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_3',
      title: 'Door 3 Check',
      question: 'Is door 3 functioning properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_4',
      title: 'Door 4 Check',
      question: 'Is door 4 functioning properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'lte_device',
      title: 'LTE Device',
      question: 'Is the LTE device working properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'underside_inspection',
      title: 'Underside Inspection',
      question: 'Please check the underside of the robot for any debris, please clean around the wheels and make sure all ground contacts can reach the floor.',
      type: 'yes_no_plus',
      required: true,
      imageRequired: 'mandatory' // Always required
    }
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleResponse = (response) => {
    const newResponses = { ...responses, [currentQuestion.id]: response }
    setResponses(newResponses)
    
    // Move to next question after short delay
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }, 500)
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      const completedSession = {
        ...session,
        responses,
        images,
        notes,
        status: 'completed',
        completedTime: new Date().toISOString(),
        completedDate: new Date().toLocaleDateString(),
        completedTimeFormatted: new Date().toLocaleString(),
        endTime: new Date(),
        duration: Math.round((new Date() - new Date(session.startTime)) / (1000 * 60)) + ' minutes',
        overallStatus: 'completed'
      }

      // Save to localStorage as backup
      const existingReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      existingReports.push(completedSession)
      localStorage.setItem('maintenanceReports', JSON.stringify(existingReports))

      // Try to save to Firebase
      try {
        // Update the original inspection in Firebase with only completion data
        await apiService.updateInspection(session.id, {
          status: 'completed',
          overallStatus: 'completed',
          maintenance_items: responses, // Backend expects this field name
          completedTime: new Date().toISOString(),
          completedDate: new Date().toLocaleDateString(),
          duration: Math.round((new Date() - new Date(session.startTime)) / (1000 * 60)) + ' minutes'
        })
        console.log('Inspection updated in Firebase successfully')
      } catch (firebaseError) {
        console.error('Firebase update failed, data saved locally:', firebaseError)
      }

      if (onComplete) {
        onComplete(completedSession)
      }

      navigate('/completion', { state: { session: completedSession, robot, user } })
    } catch (error) {
      console.error('Error completing inspection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Checklist</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{currentQuestionIndex + 1}</Badge>
              {currentQuestion?.title}
            </CardTitle>
            <CardDescription>
              {currentQuestion?.question}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleResponse('yes')}
                variant={responses[currentQuestion?.id] === 'yes' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Yes
              </Button>
              <Button
                onClick={() => handleResponse('no')}
                variant={responses[currentQuestion?.id] === 'no' ? 'destructive' : 'outline'}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                No
              </Button>
              <Button
                onClick={() => setShowChoiceModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Show images for this question */}
            {images[currentQuestion?.id] && images[currentQuestion.id].length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Photos:</p>
                <div className="flex flex-wrap gap-2">
                  {images[currentQuestion.id].map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={`Photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border-2 border-blue-200"
                      />
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Completing...' : 'Complete Inspection'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === totalQuestions - 1}
            >
              Next
            </Button>
          )}
        </div>

        {/* Choice Modal */}
        {showChoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add to Question</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowChoiceModal(false)
                    setShowNoteDialog(true)
                  }}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  Add Note
                </Button>
                <Button
                  onClick={() => {
                    setShowChoiceModal(false)
                    setShowFullScreenCamera(true)
                  }}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              <Button
                onClick={() => setShowChoiceModal(false)}
                variant="ghost"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Note Dialog */}
        {showNoteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Note</h3>
              <Textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Enter your notes here..."
                className="mb-4"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const newNotes = { ...notes, [currentQuestion.id]: currentNote }
                    setNotes(newNotes)
                    setCurrentNote('')
                    setShowNoteDialog(false)
                  }}
                  className="flex-1"
                >
                  Save Note
                </Button>
                <Button
                  onClick={() => {
                    setCurrentNote('')
                    setShowNoteDialog(false)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Camera */}
        {showFullScreenCamera && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex-1 relative">
              <video
                ref={(video) => {
                  if (video && !cameraStream) {
                    navigator.mediaDevices.getUserMedia({ 
                      video: { facingMode: 'environment' } 
                    }).then(stream => {
                      video.srcObject = stream
                      setCameraStream(stream)
                    }).catch(err => {
                      console.error('Camera error:', err)
                      alert('Camera access denied or not available')
                      setShowFullScreenCamera(false)
                    })
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex justify-center gap-4">
              <Button
                onClick={() => {
                  // Capture photo logic
                  const canvas = document.createElement('canvas')
                  const video = document.querySelector('video')
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight
                  const ctx = canvas.getContext('2d')
                  ctx.drawImage(video, 0, 0)
                  const imageUrl = canvas.toDataURL('image/jpeg')
                  
                  const newImage = {
                    id: `img_${Date.now()}`,
                    questionId: currentQuestion.id,
                    url: imageUrl,
                    timestamp: new Date().toISOString()
                  }
                  
                  const questionImages = images[currentQuestion.id] || []
                  const newImages = {
                    ...images,
                    [currentQuestion.id]: [...questionImages, newImage]
                  }
                  setImages(newImages)
                  
                  // Stop camera
                  if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop())
                    setCameraStream(null)
                  }
                  setShowFullScreenCamera(false)
                }}
                className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <Button
                onClick={() => {
                  if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop())
                    setCameraStream(null)
                  }
                  setShowFullScreenCamera(false)
                }}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MaintenanceChecklist

