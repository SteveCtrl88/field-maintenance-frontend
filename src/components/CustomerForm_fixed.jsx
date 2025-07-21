import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Bot,
  User,
  ExternalLink,
  Camera
} from 'lucide-react'

const CustomerForm = ({ user, mode }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = mode === 'edit'

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    googleMapsLink: '',
    contactPerson: '',
    phone: '',
    email: '',
    notes: '',
    inspectionWeek: '1', // 1st, 2nd, 3rd, 4th week
    inspectionDay: 'monday',
    technician: '',
    robots: []
  })

  const [availableRobotTypes, setAvailableRobotTypes] = useState([
    { id: 1, name: 'ServiceBot Pro X1', image: '/api/placeholder/150/100' },
    { id: 2, name: 'ServiceBot Pro X2', image: '/api/placeholder/150/100' },
    { id: 3, name: 'ServiceBot Lite', image: '/api/placeholder/150/100' }
  ])

  const [technicians] = useState([
    'John Smith',
    'Sarah Wilson',
    'Mike Johnson',
    'Emily Davis'
  ])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form data when component mounts or ID changes
  useEffect(() => {
    if (!isEditing) {
      // Reset form for new customer
      setFormData({
        name: '',
        address: '',
        googleMapsLink: '',
        contactPerson: '',
        phone: '',
        email: '',
        notes: '',
        inspectionWeek: '1',
        inspectionDay: 'monday',
        technician: '',
        robots: []
      })
    }
  }, [isEditing, id])

  // Fetch customer data for editing
  useEffect(() => {
    if (isEditing && id) {
      console.log('Fetching customer data for ID:', id)
      const fetchCustomer = async () => {
        try {
          setLoading(true)
          // Clear previous data first
          setFormData({
            name: '',
            address: '',
            googleMapsLink: '',
            contactPerson: '',
            phone: '',
            email: '',
            notes: '',
            inspectionWeek: '1',
            inspectionDay: 'monday',
            technician: '',
            robots: []
          })
          
          const response = await fetch(`https://nghki1clpnz3.manus.space/api/v1/customers/${id}`)
          const result = await response.json()
          
          console.log('API Response for customer', id, ':', result)
          
          if (result.success && result.data) {
            const customer = result.data
            console.log('Setting form data with customer:', customer)
            
            setFormData({
              name: customer.name || '',
              address: customer.address || '',
              googleMapsLink: customer.google_maps_link || '',
              contactPerson: customer.contact_person || '',
              phone: customer.phone || '',
              email: customer.email || '',
              notes: customer.notes || '',
              inspectionWeek: customer.inspection_schedule?.week_of_month?.replace(/\D/g, '') || '1',
              inspectionDay: customer.inspection_schedule?.day_of_week?.toLowerCase() || 'monday',
              technician: customer.inspection_schedule?.assigned_technician || '',
              robots: customer.robots || []
            })
          } else {
            console.error('Failed to fetch customer:', result.error)
            alert('Failed to load customer data: ' + (result.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Error fetching customer:', error)
          alert('Error loading customer data: ' + error.message)
        } finally {
          setLoading(false)
        }
      }
      
      fetchCustomer()
    }
  }, [isEditing, id]) // Added id to dependency array

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddRobot = () => {
    const newRobot = {
      id: Date.now(),
      name: '',
      serialNumber: '',
      typeId: '',
      installationDate: '',
      location: ''
    }
    setFormData(prev => ({
      ...prev,
      robots: [...prev.robots, newRobot]
    }))
  }

  const handleRemoveRobot = (robotId) => {
    setFormData(prev => ({
      ...prev,
      robots: prev.robots.filter(robot => robot.id !== robotId)
    }))
  }

  const handleRobotChange = (robotId, field, value) => {
    setFormData(prev => ({
      ...prev,
      robots: prev.robots.map(robot => 
        robot.id === robotId ? { ...robot, [field]: value } : robot
      )
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Company name is required')
        return
      }
      
      if (!formData.contactPerson.trim()) {
        alert('Contact person is required')
        return
      }

      // Prepare data for API
      const customerData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        google_maps_link: formData.googleMapsLink.trim(),
        contact_person: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim(),
        inspection_schedule: {
          week_of_month: `${formData.inspectionWeek}${getOrdinalSuffix(formData.inspectionWeek)}`,
          day_of_week: formData.inspectionDay.charAt(0).toUpperCase() + formData.inspectionDay.slice(1),
          assigned_technician: formData.technician
        },
        robots: formData.robots.map(robot => ({
          name: robot.name,
          serial_number: robot.serialNumber,
          type_id: robot.typeId,
          installation_date: robot.installationDate,
          location: robot.location
        }))
      }

      console.log('Sending customer data:', customerData)

      const url = isEditing 
        ? `https://nghki1clpnz3.manus.space/api/v1/customers/${id}`
        : 'https://nghki1clpnz3.manus.space/api/v1/customers'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })

      const result = await response.json()
      console.log('Save response:', result)

      if (result.success) {
        alert(isEditing ? 'Customer updated successfully!' : 'Customer created successfully!')
        navigate('/customers')
      } else {
        console.error('Save failed:', result.error)
        alert('Failed to save customer: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getOrdinalSuffix = (num) => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">Loading customer data...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch the customer information.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/customers')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Customer' : 'Add New Customer'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Customer contact and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="googleMapsLink"
                    placeholder="https://maps.google.com/..."
                    value={formData.googleMapsLink}
                    onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                  />
                  {formData.googleMapsLink && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(formData.googleMapsLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="maintenance@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions, access requirements, etc."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspection Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Inspection Schedule</CardTitle>
              <CardDescription>Set the frequency and timing for maintenance inspections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Week of Month</Label>
                  <Select value={formData.inspectionWeek} onValueChange={(value) => handleInputChange('inspectionWeek', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Week</SelectItem>
                      <SelectItem value="2">2nd Week</SelectItem>
                      <SelectItem value="3">3rd Week</SelectItem>
                      <SelectItem value="4">4th Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Day of Week</Label>
                  <Select value={formData.inspectionDay} onValueChange={(value) => handleInputChange('inspectionDay', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned Technician</Label>
                  <Select value={formData.technician} onValueChange={(value) => handleInputChange('technician', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule: Every {formData.inspectionWeek}{getOrdinalSuffix(formData.inspectionWeek)} {formData.inspectionDay.charAt(0).toUpperCase() + formData.inspectionDay.slice(1)} of the month
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Robot Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Robot Management</CardTitle>
                  <CardDescription>Manage robots assigned to this customer</CardDescription>
                </div>
                <Button onClick={handleAddRobot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Robot
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.robots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No robots assigned yet. Click "Add Robot" to get started.
                </div>
              ) : (
                formData.robots.map((robot, index) => (
                  <Card key={robot.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Robot #{index + 1}</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveRobot(robot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Robot Name</Label>
                          <Input
                            placeholder="e.g., Reception Bot"
                            value={robot.name}
                            onChange={(e) => handleRobotChange(robot.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Serial Number</Label>
                          <Input
                            placeholder="e.g., RBT-001"
                            value={robot.serialNumber}
                            onChange={(e) => handleRobotChange(robot.id, 'serialNumber', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Robot Type</Label>
                        <Select 
                          value={robot.typeId} 
                          onValueChange={(value) => handleRobotChange(robot.id, 'typeId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select robot type" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRobotTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {robot.typeId && (
                          <div className="mt-2 text-sm text-gray-600">
                            Selected Type: {availableRobotTypes.find(t => t.id.toString() === robot.typeId)?.name}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Installation Date</Label>
                          <Input
                            type="date"
                            value={robot.installationDate}
                            onChange={(e) => handleRobotChange(robot.id, 'installationDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Location in Building</Label>
                          <Input
                            placeholder="e.g., Building A - Floor 2 - Reception Area"
                            value={robot.location}
                            onChange={(e) => handleRobotChange(robot.id, 'location', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/customers')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Create Customer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerForm

