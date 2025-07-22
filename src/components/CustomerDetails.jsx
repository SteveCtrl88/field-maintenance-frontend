import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Bot,
  User,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Camera
} from 'lucide-react'
import apiService from '../services/api'

const CustomerDetails = ({ user }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch customer data and inspection history
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        const result = await apiService.getCustomer(id)
        
        if (result.success && result.data) {
          setCustomer(result.data)
          
          // Load inspection history for this customer
          const localReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
          const customerInspections = localReports.filter(report => 
            report.customerId === id || 
            report.customerName === result.data.name ||
            report.customerName === result.data.companyName
          )
          
          // Sort by completion time (most recent first)
          customerInspections.sort((a, b) => {
            const timeA = new Date(a.completedTime)
            const timeB = new Date(b.completedTime)
            return timeB - timeA
          })
          
          setInspections(customerInspections)
        } else {
          setError('Failed to load customer data')
        }
      } catch (error) {
        console.error('Error fetching customer:', error)
        setError('Error loading customer data')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchCustomerData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Customer not found'}</p>
          <Button onClick={() => navigate('/customers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  const getInspectionScheduleText = () => {
    if (!customer.inspection_schedule) return 'Not scheduled'
    const { week_of_month, day_of_week } = customer.inspection_schedule
    return `Every ${week_of_month} ${day_of_week} of the month`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/customers')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Customers
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Customer Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.role} • {user?.name}
              </span>
              <Button 
                onClick={() => navigate(`/customers/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      {customer.profile_picture ? (
                        <img 
                          src={customer.profile_picture} 
                          alt={`${customer.name} profile`}
                          className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="flex items-center text-2xl">
                        {customer.name}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Customer contact and location details
                      </CardDescription>
                    </div>
                  </div>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company Name</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.contact_person || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="mt-1 flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-900">{customer.address || 'Not specified'}</p>
                        {customer.google_maps_link && (
                          <a 
                            href={customer.google_maps_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center mt-1"
                          >
                            View on Google Maps
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="mt-1 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-sm text-gray-900">{customer.phone || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="mt-1 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="text-sm text-gray-900">{customer.email || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {customer.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{customer.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Inspection Schedule */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Inspection Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Frequency</label>
                    <p className="mt-1 text-sm text-gray-900">{getInspectionScheduleText()}</p>
                  </div>
                  
                  {customer.inspection_schedule?.assigned_technician && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Assigned Technician</label>
                      <p className="mt-1 text-sm text-gray-900">{customer.inspection_schedule.assigned_technician}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Robot Information */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    Robot Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Bot className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Robot data will be displayed here</p>
                    <p className="text-xs text-gray-400 mt-1">Feature coming soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection History */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Inspection History
                  </CardTitle>
                  <CardDescription>
                    Previous and upcoming maintenance inspections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {inspections.length > 0 ? (
                    <div className="space-y-4">
                      {inspections.map((inspection) => (
                        <div key={inspection.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {inspection.status === 'completed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : inspection.status === 'in_progress' ? (
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                ) : (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">
                                    {inspection.robotSerial || 'Robot Inspection'}
                                  </h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={
                                      inspection.status === 'completed' 
                                        ? 'bg-green-100 text-green-800'
                                        : inspection.status === 'in_progress'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {inspection.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                  <div className="flex items-center space-x-4">
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {inspection.completedDate || new Date(inspection.completedTime).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {inspection.technicianName || 'Unknown Technician'}
                                    </span>
                                  </div>
                                </div>
                                {inspection.status === 'completed' && (
                                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center space-x-4">
                                      <span>Duration: {inspection.duration || 'N/A'}</span>
                                      <span className="flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {inspection.issues || 0} issues
                                      </span>
                                      <span className="flex items-center">
                                        <Camera className="h-3 w-3 mr-1" />
                                        {inspection.photos || 0} photos
                                      </span>
                                    </div>
                                    <div>
                                      Overall Status: 
                                      <span className={`ml-1 font-medium ${
                                        inspection.overallStatus === 'excellent' ? 'text-green-600' :
                                        inspection.overallStatus === 'good' ? 'text-blue-600' :
                                        inspection.overallStatus === 'fair' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {inspection.overallStatus || 'Good'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {inspection.completedTimeFormatted || new Date(inspection.completedTime).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No inspection history found</p>
                      <p className="text-sm">Completed inspections will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerDetails

