import emailjs from 'emailjs-com'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  FileText, 
  Mail, 
  QrCode, 
  Home, 
  Download,
  Clock,
  User,
  Building,
  Loader2
} from 'lucide-react'
import pdfService from '../services/pdfService'

const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const CompletionScreen = ({ user, onNewMaintenance }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, robot } = location.state || {}

  // If no session data, redirect to dashboard
  if (!session) {
    navigate('/dashboard')
    return null
  }

  const handleNewMaintenance = () => {
    onNewMaintenance()
    navigate('/scan')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  // Calculate session duration
  const duration = session.endTime - session.startTime
  const durationMinutes = Math.round(duration / (1000 * 60))

  // Count responses and images
  const totalResponses = Object.keys(session.responses).length
  const totalImages = Object.values(session.images).reduce((acc, imgs) => acc + imgs.length, 0)

  // Mock PDF generation and email sending
  const handleDownloadReport = async () => {
    
    try {
      // Prepare report data from session information
      const reportData = pdfService.prepareReportData(session, robot, user, robot.customer)

      // Generate and download PDF
      await pdfService.generatePDFReport(reportData)

      // Show success message
      alert('PDF report downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const handleEmailReport = async () => {
    try {
      const customerEmail = robot?.customer?.email || robot?.customerEmail || 'customer@example.com'
      const reportData = pdfService.prepareReportData(session, robot, user, robot.customer)

      // Generate PDF (uses backend or fallback)
      await pdfService.generatePDFReport(reportData)

      const templateParams = {
        to_email: customerEmail,
        technician: user?.name || user?.email || 'Technician',
        report_date: reportData.report_date,
        message: 'Maintenance report attached.'
      }

      await emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams, EMAIL_PUBLIC_KEY)
      alert(`Email sent to ${customerEmail}`)
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Maintenance Complete</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Success Alert */}
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Maintenance completed successfully!</strong> The report has been generated and is ready for delivery.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Session Summary
                </CardTitle>
                <CardDescription>Maintenance session details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-lg">{durationMinutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Questions Completed</p>
                    <p className="text-lg">{totalResponses}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Photos Captured</p>
                    <p className="text-lg">{totalImages}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Technician</p>
                      <p className="text-base">{user?.name || user?.email || 'Unknown Technician'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Robot Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Robot Information
                </CardTitle>
                <CardDescription>Serviced robot details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Serial Number</p>
                  <p className="text-lg font-mono">{robot?.serialNumber || robot?.serial_number || 'Unknown'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Model</p>
                  <p className="text-base">{robot?.model || robot?.robotModel || 'Unknown Model'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-base">{robot?.customer?.name || robot?.customerName || 'Unknown Customer'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base">{robot?.location || robot?.customerAddress || 'Unknown Location'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Maintenance Report
              </CardTitle>
              <CardDescription>
                Generate and deliver the maintenance report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleDownloadReport} variant="outline" className="h-16">
                  <div className="text-center">
                    <Download className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Download PDF Report</div>
                  </div>
                </Button>
                
                <Button onClick={handleEmailReport} className="h-16">
                  <div className="text-center">
                    <Mail className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Email to Customer</div>
                    <div className="text-xs opacity-75">{robot?.customer?.email || robot?.customerEmail || 'customer@example.com'}</div>
                  </div>
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Report includes:</strong> All checklist responses, captured images, technician notes, 
                  timestamps, and robot information. The report will be automatically formatted and branded 
                  for professional delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Choose your next action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleNewMaintenance} 
                  variant="outline" 
                  className="h-16"
                >
                  <div className="text-center">
                    <QrCode className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Start New Maintenance</div>
                    <div className="text-xs text-gray-500">Scan another robot</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={handleDashboard} 
                  className="h-16"
                >
                  <div className="text-center">
                    <Home className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Return to Dashboard</div>
                    <div className="text-xs opacity-75">View all activities</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Session ID</p>
                  <p className="font-mono">{session.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Start Time</p>
                  <p>{session.startTime.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Time</p>
                  <p>{session.endTime.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p>{session.startTime.toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default CompletionScreen

