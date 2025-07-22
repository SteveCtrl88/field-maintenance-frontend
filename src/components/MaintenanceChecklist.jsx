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
  Loader2
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
      id: 'door_1',
      title: 'Door 1 Test',
      question: 'Open and close door 1. Is the door in good working order?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'door_2',
      title: 'Door 2 Test',
      question: 'Open and close door 2. Is the door in good working order?',
      type: 'yes_no',
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
      id: 'lte_device',
      title: 'LTE Device Check',
      question: 'Is the LTE device in good working order and secure inside the robot?',
      type: 'yes_no',
      required: true
    },
    {
      id: 'battery_level',
      title: 'Battery Level Test',
      question: 'Test the battery level. Is it functioning correctly?',
      type: 'yes_no_conditional',
      required: true,
      conditionalNote: true,
      conditionalImage: true
    },
    {
      id: 'underside_inspected',
      title: 'Underside Inspection',
      question: 'Have you inspected the underside of the robot?',
      type: 'yes_no',
      required: true
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
      images
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

  const handleComplete = () => {
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
      responses: responses,
      images: images,
      status: 'completed'
    }

    // Store the completion record
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

  const allQuestionsCompleted = () => {
    return questions.every(q => responses[q.id] !== undefined)
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
              <Button
                variant={response === 'not_applicable' ? 'secondary' : 'outline'}
                onClick={() => handleResponse(currentQuestion.id, 'not_applicable')}
                className="flex-1"
              >
                N/A
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

      default:
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
    }
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
                <Circle className="h-5 w-5" />
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
                  <p className="text-xs text-gray-500 mt-1">
                    Camera will activate when you capture
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Simulate image capture
                    const newImage = {
                      id: Date.now(),
                      url: '/api/placeholder/400/300',
                      timestamp: new Date().toISOString(),
                      note: currentNote
                    }
                    
                    const questionImages = images[currentQuestion.id] || []
                    const newImages = {
                      ...images,
                      [currentQuestion.id]: [...questionImages, newImage]
                    }
                    
                    setImages(newImages)
                    setCurrentNote('')
                    setShowImageCapture(false)
                  }} 
                  className="flex-1"
                >
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

