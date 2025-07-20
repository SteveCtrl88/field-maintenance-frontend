import { useState, useEffect } from 'react'
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

  // Mock data for editing
  useEffect(() => {
    if (isEditing && id) {
      // In a real app, this would fetch from API
      const mockCustomer = {
        name: 'Acme Corporation',
        address: '123 Business Ave, New York, NY 10001',
        googleMapsLink: 'https://maps.google.com/?q=123+Business+Ave+New+York+NY',
        contactPerson: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'maintenance@acme.com',
        notes: 'Customer prefers morning inspections. Building access requires security clearance.',
        inspectionWeek: '3',
        inspectionDay: 'wednesday',
        technician: 'John Smith',
        robots: [
          {
            id: 1,
            name: 'Reception Bot',
            serialNumber: 'RBT-001',
            typeId: 1,
            installationDate: '2024-01-15',
            location: 'Building A - Floor 2 - Reception'
          },
          {
            id: 2,
            name: 'Warehouse Bot 1',
            serialNumber: 'RBT-002',
            typeId: 2,
            installationDate: '2024-02-20',
            location: 'Building A - Floor 1 - Warehouse'
          }
        ]
      }
      setFormData(mockCustomer)
    }
  }, [isEditing, id])

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

  const handleSave = () => {
    // In a real app, this would save to API
    console.log('Saving customer:', formData)
    navigate('/customers')
  }

  const getRobotTypeName = (typeId) => {
    const type = availableRobotTypes.find(t => t.id === parseInt(typeId))
    return type ? type.name : 'Unknown Type'
  }

  const getInspectionScheduleText = () => {
    const weekNames = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' }
    const dayNames = {
      'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday',
      'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday'
    }
    return `Every ${weekNames[formData.inspectionWeek]} ${dayNames[formData.inspectionDay]} of the month`
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
                size="sm" 
                onClick={() => navigate('/customers')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Customers
              </Button>
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="googleMapsLink"
                    value={formData.googleMapsLink}
                    onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="maintenance@company.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Special instructions, access requirements, etc."
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
                  <Label htmlFor="inspectionWeek">Week of Month</Label>
                  <Select value={formData.inspectionWeek} onValueChange={(value) => handleInputChange('inspectionWeek', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
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
                  <Label htmlFor="inspectionDay">Day of Week</Label>
                  <Select value={formData.inspectionDay} onValueChange={(value) => handleInputChange('inspectionDay', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
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
                  <Label htmlFor="technician">Assigned Technician</Label>
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
              
              {formData.inspectionWeek && formData.inspectionDay && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Schedule: {getInspectionScheduleText()}
                    </span>
                  </div>
                </div>
              )}
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
            <CardContent>
              {formData.robots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No robots added yet</p>
                  <Button variant="outline" onClick={handleAddRobot} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Robot
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.robots.map((robot, index) => (
                    <Card key={robot.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Robot #{index + 1}</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRobot(robot.id)}
                            className="text-red-600 hover:text-red-700"
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
                              value={robot.name}
                              onChange={(e) => handleRobotChange(robot.id, 'name', e.target.value)}
                              placeholder="e.g., Reception Bot"
                            />
                          </div>
                          <div>
                            <Label>Serial Number</Label>
                            <Input
                              value={robot.serialNumber}
                              onChange={(e) => handleRobotChange(robot.id, 'serialNumber', e.target.value)}
                              placeholder="e.g., RBT-001"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Robot Type</Label>
                            <Select 
                              value={robot.typeId.toString()} 
                              onValueChange={(value) => handleRobotChange(robot.id, 'typeId', parseInt(value))}
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
                          </div>
                          <div>
                            <Label>Installation Date</Label>
                            <Input
                              type="date"
                              value={robot.installationDate}
                              onChange={(e) => handleRobotChange(robot.id, 'installationDate', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Location in Building</Label>
                          <Input
                            value={robot.location}
                            onChange={(e) => handleRobotChange(robot.id, 'location', e.target.value)}
                            placeholder="e.g., Building A - Floor 2 - Reception Area"
                          />
                        </div>

                        {robot.typeId && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600">
                              Selected Type: <span className="font-medium">{getRobotTypeName(robot.typeId)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => navigate('/customers')}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerForm

