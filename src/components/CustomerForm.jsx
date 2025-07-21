import React, { useState, useEffect } from 'react'
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
import apiService from '../services/api'

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
    profilePicture: '',
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
        profilePicture: '',
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
            profilePicture: '',
            inspectionWeek: '1',
            inspectionDay: 'monday',
            technician: '',
            robots: []
          })
          
          const result = await apiService.getCustomer(id)
          
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
              profilePicture: customer.profile_picture || '',
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
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
      
      // Define action text for logging
      const actionText = isEditing ? 'Updating' : 'Creating'
      
      // Prepare the data for the API
      const customerData = {
        name: formData.name,
        contact_person: formData.contactPerson,
        address: formData.address,
        google_maps_link: formData.googleMapsLink,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        profile_picture: formData.profilePicture,
        inspection_schedule: {
          week_of_month: formData.inspectionWeek === '1' ? '1st' : 
                         formData.inspectionWeek === '2' ? '2nd' :
                         formData.inspectionWeek === '3' ? '3rd' : '4th',
          day_of_week: formData.inspectionDay.charAt(0).toUpperCase() + formData.inspectionDay.slice(1),
          assigned_technician: formData.technician
        },
        robots: formData.robots
      }

      console.log(`${actionText} customer with ID: ${id}`)
      console.log('Data:', customerData)

      let result
      if (isEditing && id) {
        console.log('Updating customer via API service')
        result = await apiService.updateCustomer(id, customerData)
      } else {
        console.log('Creating customer via API service')
        result = await apiService.createCustomer(customerData)
      }
      
      console.log('API Response:', result)
      
      if (result.success) {
        console.log(`Customer ${isEditing ? 'updated' : 'created'} successfully:`, result.data)
        alert(`Customer ${isEditing ? 'updated' : 'created'} successfully!`)
        navigate('/customers')
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} customer:`, result.error)
        alert(`Failed to ${isEditing ? 'update' : 'create'} customer: ` + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} customer:`, error)
      alert(`Error ${isEditing ? 'updating' : 'creating'} customer: ` + error.message)
    } finally {
      setSaving(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer data...</p>
        </div>
      </div>
    )
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
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Customer' : 'Add New Customer'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.role} • {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Info */}
      {isEditing && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
            <strong>Debug:</strong> Editing customer ID: {id} | Customer Name: {formData.name || 'Loading...'}
          </div>
        </div>
      )}

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
                  {/* Profile Picture Upload */}
                  <div>
                    <Label htmlFor="profilePicture">Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      {formData.profilePicture ? (
                        <div className="relative">
                          <img 
                            src={formData.profilePicture} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => handleInputChange('profilePicture', '')}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <Input
                          id="profilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profilePicture').click()}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {formData.profilePicture ? 'Change Picture' : 'Upload Picture'}
                        </Button>
                      </div>
                    </div>
                  </div>

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
                    <Input
                      id="googleMapsLink"
                      placeholder="https://maps.google.com/..."
                      value={formData.googleMapsLink}
                      onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                    />
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
                      placeholder="Additional notes about the customer..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </div>
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
                  <CardDescription>
                    Set the frequency and timing for maintenance inspections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <SelectItem key={tech || ''} value={tech || ''}>{tech || 'Unknown'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Schedule: {getInspectionScheduleText()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Robot Management */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    Robot Management
                  </CardTitle>
                  <CardDescription>
                    Manage robots assigned to this customer
                  </CardDescription>
                </div>
                <Button onClick={handleAddRobot} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Robot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.robots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No robots assigned yet</p>
                  <p className="text-sm">Click "Add Robot" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.robots.map((robot, index) => (
                    <Card key={robot.id} className="border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Robot #{index + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRobot(robot.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Robot Name</Label>
                            <Input
                              placeholder="Enter robot name"
                              value={robot.name}
                              onChange={(e) => handleRobotChange(robot.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Serial Number</Label>
                            <Input
                              placeholder="Enter serial number"
                              value={robot.serialNumber}
                              onChange={(e) => handleRobotChange(robot.id, 'serialNumber', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Robot Type</Label>
                          <Select 
                            value={robot.typeId ? robot.typeId.toString() : ''} 
                            onValueChange={(value) => handleRobotChange(robot.id, 'typeId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select robot type" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRobotTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id ? type.id.toString() : ''}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {robot.typeId && (
                            <p className="text-sm text-gray-600 mt-1">
                              Selected Type: {getRobotTypeName(robot.typeId)}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                              placeholder="e.g., Floor 2, Room 201"
                              value={robot.location}
                              onChange={(e) => handleRobotChange(robot.id, 'location', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={() => navigate('/customers')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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

// Fixed React import
