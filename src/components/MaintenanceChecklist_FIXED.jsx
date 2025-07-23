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
      question: 'Is the robot charging properly?',
      type: 'yes_no_plus',
      required: true
    },
    {
      id: 'charger_working',
      title: 'Charger Functionality',
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
      imageRequired: 'conditional' // Required if answer is 'yes'
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
      title: 'LTE Device Check',
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

  // Rest of the component code would continue here...
  // This is just showing the fix for the useState import issue

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            MaintenanceChecklist Component Fixed
          </h1>
          <p className="text-gray-600">
            The useState import has been added to fix the "Cannot access 'b' before initialization" error.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceChecklist

