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
  const [showImageCapture, setShowImageCapture] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [isCapturingImage, setIsCapturingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleImageCapture = async () => {
    setIsCapturingImage(true)
    
    try {
      // Simulate image capture and upload to Firebase Storage
      const imageData = {
        id: `img_${Date.now()}`,
        questionId: currentQuestion.id,
        url: `/api/placeholder/400/300?t=${Date.now()}`,
        filename: `inspection_${currentQuestion.id}_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
        note: currentNote || '',
        uploadedToFirebase: true
      }
      
      const questionImages = images[currentQuestion.id] || []
      const newImages = {
        ...images,
        [currentQuestion.id]: [...questionImages, imageData]
      }
      
      setImages(newImages)
      setCurrentNote('')
      setShowImageCapture(false)
      
      // Update session
      const updatedSession = {
        ...session,
        responses,
        images: newImages,
        notes
      }
      onSessionUpdate(updatedSession)
      
    } catch (error) {
      console.error('Error capturing image:', error)
    } finally {
      setIsCapturingImage(false)
    }
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

      // Save to Firebase via API
      try {
        const result = await apiService.createInspection(completionData)
        if (result.success) {
          console.log('Inspection saved to Firebase:', result.data)
        }
      } catch (apiError) {
        console.error('Error saving to Firebase:', apiError)
      }

      // Store locally as backup
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
            onClick={() => setShowNoteDialog(true)}
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
                <p className="text-sm font-medium text-blue-800">
                  {questionImages.length} photo(s) captured
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowImageCapture(true)} 
            variant="outline" 
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
          <Button 
            onClick={() => setShowNoteDialog(true)} 
            variant="outline" 
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
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

      {/* Note Dialog */}
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

      {/* Image Capture Modal */}
      {showImageCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Capture Image</CardTitle>
              <CardDescription>Take a photo for documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Camera preview</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Camera will activate when you capture
                  </p>
                </div>
              </div>
              
              {currentNote && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {currentNote}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note for this image (optional)..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleImageCapture}
                  className="flex-1"
                  disabled={isCapturingImage}
                >
                  {isCapturingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowImageCapture(false)
                    setCurrentNote('')
                  }}
                  disabled={isCapturingImage}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MaintenanceChecklist

