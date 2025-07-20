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
  Check
} from 'lucide-react'

const MaintenanceChecklist = ({ session, robot, user, onSessionUpdate, onComplete }) => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState(session.responses || {})
  const [images, setImages] = useState(session.images || {})
  const [showImageCapture, setShowImageCapture] = useState(false)
  const [currentNote, setCurrentNote] = useState('')

  // Define all maintenance questions
  const questions = [
    {
      id: 'display_working',
      title: 'Display Check',
      question: 'Is the display on and in good working order?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'robot_charging',
      title: 'Charging System',
      question: 'Is the robot charging correctly?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'charger_working',
      title: 'Charger Condition',
      question: 'Is the charger in good working order?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'visible_damage',
      title: 'Damage Inspection',
      question: 'Do you see any damage on the machine?',
      type: 'yes_no_conditional',
      required: true,
      conditionalNote: true,
      conditionalImage: true
    },
    {
      id: 'door_1',
      title: 'Door 1 Test',
      question: 'Open and close door 1. Is the door in good working order?',
      type: 'yes_no_optional',
      required: true
    },
    {
      id: 'door_2',
      title: 'Door 2 Test',
      question: 'Open and close door 2. Is the door in good working order?',
      type: 'yes_no_optional',
      required: true
    },
    {
      id: 'door_3',
      title: 'Door 3 Test',
      question: 'Open and close door 3. Is the door in good working order?',
      type: 'yes_no_optional',
      required: true
    },
    {
      id: 'door_4',
      title: 'Door 4 Test',
      question: 'Open and close door 4. Is the door in good working order?',
      type: 'yes_no_optional',
      required: true
    },
    {
      id: 'underside_inspected',
      title: 'Underside Inspection',
      question: 'Have you inspected the underside of the robot?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'underside_condition',
      title: 'Underside Condition',
      question: 'Is everything in good working order?',
      type: 'image_note_required',
      required: true,
      dependsOn: 'underside_inspected',
      dependsOnValue: 'yes'
    },
    {
      id: 'lte_device',
      title: 'LTE Device Check',
      question: 'Is the LTE device in good working order and secure inside the robot?',
      type: 'yes_no_conditional',
      required: true,
      conditionalNote: true,
      conditionalImage: true
    }
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const completedQuestions = Object.keys(responses).length
  const progress = (completedQuestions / totalQuestions) * 100

  // Check if current question should be shown based on dependencies
  const shouldShowQuestion = (question) => {
    if (!question.dependsOn) return true
    const dependentResponse = responses[question.dependsOn]
    return dependentResponse === question.dependsOnValue
  }

  // Get next available question index
  const getNextQuestionIndex = (currentIndex) => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (shouldShowQuestion(questions[i])) {
        return i
      }
    }
    return -1 // No more questions
  }

  // Get previous available question index
  const getPreviousQuestionIndex = (currentIndex) => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (shouldShowQuestion(questions[i])) {
        return i
      }
    }
    return -1 // No previous questions
  }

  // Check if all required questions are answered
  const allQuestionsCompleted = () => {
    return questions.every(q => {
      if (!shouldShowQuestion(q)) return true
      return responses[q.id] !== undefined
    })
  }

  const handleResponse = (questionId, response) => {
    const newResponses = { ...responses, [questionId]: response }
    setResponses(newResponses)
    
    // Update session
    const updatedSession = {
      ...session,
      responses: newResponses,
      images
    }
    onSessionUpdate(updatedSession)
  }

  const handleNoteChange = (note) => {
    setCurrentNote(note)
  }

  const handleImageCapture = () => {
    // Simulate image capture
    const imageData = {
      id: Date.now(),
      questionId: currentQuestion.id,
      timestamp: new Date(),
      filename: `${currentQuestion.id}_${Date.now()}.jpg`,
      note: currentNote
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
      images: newImages
    }
    onSessionUpdate(updatedSession)
  }

  const handleNext = () => {
    const nextIndex = getNextQuestionIndex(currentQuestionIndex)
    if (nextIndex !== -1) {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const handlePrevious = () => {
    const prevIndex = getPreviousQuestionIndex(currentQuestionIndex)
    if (prevIndex !== -1) {
      setCurrentQuestionIndex(prevIndex)
    }
  }

  const handleComplete = () => {
    if (allQuestionsCompleted()) {
      // Create completion record with timestamps
      const completionData = {
        id: `RPT-${Date.now()}`,
        sessionId: session.id,
        robotId: robot.id,
        robotSerial: robot.serialNumber,
        robotModel: robot.model,
        technicianId: user.id,
        technicianName: user.name,
        customer: robot.customer || 'Unknown Customer',
        customerAddress: robot.address || 'Unknown Address',
        startTime: session.startTime,
        completedTime: new Date().toISOString(),
        completedDate: new Date().toLocaleDateString(),
        completedTimeFormatted: new Date().toLocaleTimeString(),
        duration: calculateDuration(session.startTime, new Date()),
        responses: responses,
        images: images,
        status: 'completed',
        issues: countIssues(responses),
        photos: countPhotos(images),
        notes: generateSummaryNotes(responses),
        overallStatus: determineOverallStatus(responses),
        nextMaintenance: calculateNextMaintenance()
      }

      // Store the completion record (in a real app, this would be sent to backend)
      const existingReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      existingReports.push(completionData)
      localStorage.setItem('maintenanceReports', JSON.stringify(existingReports))

      // Update session status
      const updatedSession = {
        ...session,
        responses,
        images,
        status: 'completed',
        completedTime: new Date().toISOString()
      }
      
      onSessionUpdate(updatedSession)
      onComplete(completionData)
      navigate('/complete')
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
      if (response === 'no' || response === 'yes_with_issues') {
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

  const generateSummaryNotes = (responses) => {
    const issues = []
    Object.entries(responses).forEach(([questionId, response]) => {
      const question = questions.find(q => q.id === questionId)
      if (response === 'no') {
        issues.push(`Issue with ${question?.title || questionId}`)
      }
    })
    return issues.length > 0 ? issues.join(', ') : 'All systems functioning normally, no issues found'
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
    nextDate.setMonth(nextDate.getMonth() + 1) // Next maintenance in 1 month
    return nextDate.toLocaleDateString()
  }

  const renderQuestionContent = () => {
    const response = responses[currentQuestion.id]
    const questionImages = images[currentQuestion.id] || []

    switch (currentQuestion.type) {
      case 'yes_no':
        return (
          <div className="space-y-4">
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
            </div>
          </div>
        )

      case 'yes_no_conditional':
        return (
          <div className="space-y-4">
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
            </div>
            
            {response === 'no' && (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add notes about the issue:</label>
                  <Textarea
                    placeholder="Describe the problem..."
                    value={currentNote}
                    onChange={(e) => handleNoteChange(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowImageCapture(true)} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                {questionImages.length > 0 && (
                  <div className="text-sm text-green-600">
                    {questionImages.length} photo(s) captured
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'yes_no_optional':
        return (
          <div className="space-y-4">
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
            </div>
            
            {response && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium">Would you like to add notes or take a photo?</p>
                <div className="flex gap-2">
                  <Button onClick={() => setShowImageCapture(true)} variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button onClick={() => setCurrentNote('')} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                {questionImages.length > 0 && (
                  <div className="text-sm text-green-600">
                    {questionImages.length} photo(s) captured
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'image_note_required':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-4">
                This question requires photo documentation and optional notes.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (optional):</label>
                  <Textarea
                    placeholder="Add any observations..."
                    value={currentNote}
                    onChange={(e) => handleNoteChange(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowImageCapture(true)} variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Required Photo
                </Button>
                {questionImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-green-600">
                      ✓ {questionImages.length} photo(s) captured
                    </div>
                    <Button
                      onClick={() => handleResponse(currentQuestion.id, 'completed')}
                      className="w-full"
                    >
                      Mark as Complete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Skip questions that shouldn't be shown
  useEffect(() => {
    if (!shouldShowQuestion(currentQuestion)) {
      const nextIndex = getNextQuestionIndex(currentQuestionIndex)
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex)
      }
    }
  }, [currentQuestionIndex, responses])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Maintenance Checklist</h1>
                <p className="text-sm text-gray-600">{robot.serialNumber} - {robot.model}</p>
              </div>
            </div>
            <Badge variant="outline">
              {completedQuestions} of {totalQuestions} completed
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Current Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-3">
                      {currentQuestionIndex + 1}
                    </span>
                    {currentQuestion.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {currentQuestion.question}
                  </CardDescription>
                </div>
                {responses[currentQuestion.id] && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestionContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={getPreviousQuestionIndex(currentQuestionIndex) === -1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {getNextQuestionIndex(currentQuestionIndex) !== -1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!responses[currentQuestion.id]}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!allQuestionsCompleted()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Maintenance
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Completion Status */}
          {!allQuestionsCompleted() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please complete all required questions before finishing the maintenance.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

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
                </div>
              </div>
              {currentNote && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {currentNote}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleImageCapture} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageCapture(false)}
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

