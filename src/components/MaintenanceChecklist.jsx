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
  ArrowRight, 
  Camera, 
  CheckCircle, 
  Circle, 
  FileText, 
  AlertTriangle,
  Home,
  X,
  Check,
  Loader2,
  Plus
} from 'lucide-react'
import apiService from '../services/api'

const MaintenanceChecklist = ({ session, robot, user, onSessionUpdate, onComplete }) => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState(session.responses || {})
  const [images, setImages] = useState(session.images || {})
  const [notes, setNotes] = useState(session.notes || {})
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
      question: 'Is the robot charging correctly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'charger_working',
      title: 'Charger Condition',
      question: 'Is the charger in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'damage_check',
      title: 'Damage Assessment',
      question: 'Is there any damage?',
      type: 'yes_no_plus',
      required: true,
      mandatoryImageOnYes: true
    },
    {
      id: 'door_1',
      title: 'Door 1 Test',
      question: 'Open and close door 1. Is the door in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_2',
      title: 'Door 2 Test',
      question: 'Open and close door 2. Is the door in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_3',
      title: 'Door 3 Test',
      question: 'Open and close door 3. Is the door in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'door_4',
      title: 'Door 4 Test',
      question: 'Open and close door 4. Is the door in good working order?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'lte_device',
      title: 'LTE Device Check',
      question: 'Is the LTE device in good working order and secure inside the robot?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'underside_inspection',
      title: 'Underside Inspection',
      question: 'Please check the underside of the robot for any debris, please clean around the wheels and make sure all ground contacts can reach the floor.',
      type: 'yes_no_plus',
      required: true,
      mandatoryImage: true,
      mandatoryNote: true
    }
  ]

  const currentQuestion = questions[currentQuestionIndex] || questions[0]
  const totalQuestions = questions.length
  const completedQuestions = Object.keys(responses).length
  const progress = (completedQuestions / totalQuestions) * 100

  const handleResponse = (questionId, response) => {
    const newResponses = { ...responses, [questionId]: response }
    setResponses(newResponses)
    
    // Update session
    const updatedSession = {
      ...session,
      responses: newResponses,
      images,
      notes
    }
    onSessionUpdate(updatedSession)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handlePlusClick = () => {
    setShowChoiceModal(true)
  }

  const handleChoiceModalClose = () => {
    setShowChoiceModal(false)
  }

  const handleNoteChoice = () => {
    setShowChoiceModal(false)
    setShowNoteDialog(true)
  }

  const handleCameraChoice = async () => {
    setShowChoiceModal(false)
    setShowFullScreenCamera(true)
    
    try {
      // Start camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      setCameraStream(stream)
    } catch (error) {
      console.error('Error accessing camera:', error)
      if (error.name === 'NotAllowedError') {
        alert('Camera access denied. Please allow camera permissions and try again.')
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device.')
      } else {
        alert('Error accessing camera: ' + error.message)
      }
      setShowFullScreenCamera(false)
    }
  }

  const handleImageCapture = async () => {
    if (!cameraStream) return
    
    setIsCapturingImage(true)
    
    try {
      // Create video element to capture frame
      const video = document.createElement('video')
      video.srcObject = cameraStream
      video.play()
      
      // Wait for video to load
      await new Promise(resolve => {
        video.onloadedmetadata = resolve
      })
      
      // Wait a bit for camera to adjust
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      // Create image data
      const imageData = {
        id: `img_${Date.now()}`,
        questionId: currentQuestion.id,
        url: dataUrl,
        filename: `inspection_${currentQuestion.id}_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
        note: '',
        uploadedToFirebase: false,
        size: dataUrl.length
      }
      
      const questionImages = images[currentQuestion.id] || []
      const newImages = {
        ...images,
        [currentQuestion.id]: [...questionImages, imageData]
      }
      
      setImages(newImages)
      
      // Update session
      const updatedSession = {
        ...session,
        responses,
        images: newImages,
        notes
      }
      onSessionUpdate(updatedSession)
      
      // Close camera
      handleCameraClose()
      
    } catch (error) {
      console.error('Error capturing image:', error)
      alert('Error capturing image: ' + error.message)
    } finally {
      setIsCapturingImage(false)
    }
  }

  const handleCameraClose = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowFullScreenCamera(false)
  }

  const handleNoteAdd = () => {
    if (currentNote.trim()) {
      const newNotes = {
        ...notes,
        [currentQuestion.id]: currentNote.trim()
      }
      setNotes(newNotes)
      
      // Update session
      const updatedSession = {
        ...session,
        responses,
        images,
        notes: newNotes
      }
      onSessionUpdate(updatedSession)
    }
    
    setCurrentNote('')
    setShowNoteDialog(false)
  }

  const handleComplete = async () => {
    setIsSaving(true)
    
    try {
      const completionData = {
        id: `RPT-${Date.now()}`,
        sessionId: session.id,
        robotId: robot.id,
        robotSerial: robot.serialNumber,
        robotModel: robot.model,
        customerId: robot.customerId || robot.customer?._id,
        customerName: robot.customer?.companyName || robot.customerName || 'Unknown Customer',
        customerAddress: robot.customer?.address || robot.address || 'Unknown Address',
        technicianId: user.id,
        technicianName: user.name || user.email,
        startTime: session.startTime,
        completedTime: new Date().toISOString(),
        completedDate: new Date().toLocaleDateString(),
        completedTimeFormatted: new Date().toLocaleTimeString(),
        duration: calculateDuration(session.startTime, new Date()),
        responses: responses,
        images: images,
        notes: notes,
        status: 'completed',
        issues: countIssues(responses),
        photos: countPhotos(images),
        overallStatus: determineOverallStatus(responses),
        nextMaintenance: calculateNextMaintenance(),
        type: 'maintenance_inspection'
      }

      // Try to save to Firebase via API (but don't fail if it doesn't work)
      try {
        const result = await apiService.createInspection(completionData)
        if (result.success) {
          console.log('Inspection saved to Firebase:', result.data)
        }
      } catch (apiError) {
        console.warn('Firebase API unavailable, saving locally only:', apiError)
      }

      // Always store locally as primary storage
      const existingReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      existingReports.push(completionData)
      localStorage.setItem('maintenanceReports', JSON.stringify(existingReports))

      // Update session status
      const updatedSession = {
        ...session,
        responses,
        images,
        notes,
        status: 'completed',
        completedTime: new Date().toISOString()
      }
      
      onSessionUpdate(updatedSession)
      onComplete(completionData)
      navigate('/complete')
      
    } catch (error) {
      console.error('Error completing inspection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end - start
    const diffMins = Math.round(diffMs / 60000)
    return `${diffMins} minutes`
  }

  const countIssues = (responses) => {
    let issues = 0
    Object.entries(responses).forEach(([questionId, response]) => {
      if (response === 'no') {
        issues++
      }
    })
    return issues
  }

  const countPhotos = (images) => {
    let photoCount = 0
    Object.values(images).forEach(questionImages => {
      photoCount += questionImages.length
    })
    return photoCount
  }

  const determineOverallStatus = (responses) => {
    const issueCount = countIssues(responses)
    if (issueCount === 0) return 'excellent'
    if (issueCount <= 2) return 'good'
    if (issueCount <= 4) return 'fair'
    return 'poor'
  }

  const calculateNextMaintenance = () => {
    const nextDate = new Date()
    nextDate.setMonth(nextDate.getMonth() + 3) // 3 months from now
    return nextDate.toLocaleDateString()
  }

  const allQuestionsCompleted = () => {
    return questions.every(q => {
      const hasResponse = responses[q.id] !== undefined
      
      // Check mandatory image requirements
      if (q.mandatoryImage || (q.mandatoryImageOnYes && responses[q.id] === 'yes')) {
        const questionImages = images[q.id] || []
        return hasResponse && questionImages.length > 0
      }
      
      // Check mandatory note requirements
      if (q.mandatoryNote) {
        const questionNote = notes[q.id]
        return hasResponse && questionNote && questionNote.trim().length > 0
      }
      
      return hasResponse
    })
  }

  const isQuestionComplete = (question) => {
    const hasResponse = responses[question.id] !== undefined
    
    if (question.mandatoryImage || (question.mandatoryImageOnYes && responses[question.id] === 'yes')) {
      const questionImages = images[question.id] || []
      return hasResponse && questionImages.length > 0
    }
    
    if (question.mandatoryNote) {
      const questionNote = notes[question.id]
      return hasResponse && questionNote && questionNote.trim().length > 0
    }
    
    return hasResponse
  }

  const renderQuestionContent = () => {
    const response = responses[currentQuestion.id]
    const questionImages = images[currentQuestion.id] || []
    const questionNote = notes[currentQuestion.id] || ''
    const needsMandatoryImage = currentQuestion.mandatoryImage || (currentQuestion.mandatoryImageOnYes && response === 'yes')
    const needsMandatoryNote = currentQuestion.mandatoryNote

    return (
      <div className="space-y-4">
        {/* Yes/No/+ Buttons */}
        <div className="flex gap-4">
          <Button
            variant={response === 'yes' ? 'default' : 'outline'}
            onClick={() => handleResponse(currentQuestion.id, 'yes')}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Yes
          </Button>
          <Button
            variant={response === 'no' ? 'destructive' : 'outline'}
            onClick={() => handleResponse(currentQuestion.id, 'no')}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            No
          </Button>
          <Button
            variant="outline"
            onClick={handlePlusClick}
            className="px-4"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Mandatory Requirements Alert */}
        {response && (needsMandatoryImage || needsMandatoryNote) && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {needsMandatoryImage && needsMandatoryNote && 'This question requires both a photo and notes.'}
              {needsMandatoryImage && !needsMandatoryNote && 'This question requires a photo.'}
              {!needsMandatoryImage && needsMandatoryNote && 'This question requires notes.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Notes and Images */}
        {(questionNote || questionImages.length > 0) && (
          <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {questionNote && (
              <div>
                <p className="text-sm font-medium text-blue-800">Note:</p>
                <p className="text-sm text-blue-700">{questionNote}</p>
              </div>
            )}
            {questionImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-blue-800 mb-2">
                  {questionImages.length} photo(s) captured
                </p>
                <div className="flex flex-wrap gap-2">
                  {questionImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt={`Captured photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200"
                      />
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Maintenance Checklist</h1>
                <p className="text-sm text-gray-600">
                  {robot.serialNumber} - {robot.model}
                </p>
              </div>
            </div>
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{completedQuestions} of {totalQuestions} completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isQuestionComplete(currentQuestion) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
                {currentQuestion.title}
              </CardTitle>
              <CardDescription>
                {currentQuestion.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderQuestionContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isQuestionComplete(currentQuestion)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!allQuestionsCompleted() || isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Maintenance
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Completion Status */}
          {!allQuestionsCompleted() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please complete all required questions and mandatory requirements before finishing the maintenance.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      {/* Choice Modal - Note or Photo */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Add Documentation</CardTitle>
              <CardDescription>Choose what you'd like to add</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleNoteChoice}
                className="w-full h-12"
                variant="outline"
              >
                <FileText className="h-5 w-5 mr-3" />
                Add Note
              </Button>
              <Button 
                onClick={handleCameraChoice}
                className="w-full h-12"
                variant="outline"
              >
                <Camera className="h-5 w-5 mr-3" />
                Take Photo
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleChoiceModalClose}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Note Modal */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
              <CardDescription>Add observations or comments for this question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your notes here..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleNoteAdd}
                  className="flex-1"
                  disabled={!currentNote.trim()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNoteDialog(false)
                    setCurrentNote('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Screen Camera */}
      {showFullScreenCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4 bg-black text-white">
            <Button 
              variant="ghost" 
              onClick={handleCameraClose}
              className="text-white hover:bg-gray-800"
            >
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-lg font-semibold">Take Photo</h2>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Camera View */}
          <div className="flex-1 relative">
            {cameraStream ? (
              <video
                ref={(video) => {
                  if (video && cameraStream) {
                    video.srcObject = cameraStream
                    video.play()
                  }
                }}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Starting camera...</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="p-6 bg-black">
            <div className="flex items-center justify-center">
              <Button
                onClick={handleImageCapture}
                disabled={isCapturingImage || !cameraStream}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black"
                size="lg"
              >
                {isCapturingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Camera className="h-8 w-8" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceChecklist

