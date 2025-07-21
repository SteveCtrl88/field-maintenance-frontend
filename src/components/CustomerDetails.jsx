import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  ExternalLink
} from 'lucide-react'

const CustomerDetails = ({ user }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://nghki1clpnz3.manus.space/api/v1/customers/${id}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setCustomer(result.data)
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
      fetchCustomer()
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
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Customer contact and location details
                  </CardDescription>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerDetails

