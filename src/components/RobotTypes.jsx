import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  QrCode, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Bot,
  User,
  Camera,
  Upload,
  Save,
  X
} from 'lucide-react'
import apiService from '../services/api'

const RobotTypes = ({ user }) => {
  const navigate = useNavigate()
  const [robotTypes, setRobotTypes] = useState([])

  // Load robot types from Firebase
  const loadRobotTypes = async () => {
    try {
      const result = await apiService.getRobotTypes()
      if (result.success) {
        setRobotTypes(result.data || [])
      } else {
        console.error('Failed to load robot types:', result.error)
        // Fallback to empty array
        setRobotTypes([])
      }
    } catch (error) {
      console.error('Error loading robot types:', error)
      setRobotTypes([])
    } finally {
      // no-op
    }
  }

  useEffect(() => {
    loadRobotTypes()
  }, [])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    model: '',
    image: '',
    specifications: {
      height: '',
      weight: '',
      battery: '',
      sensors: ''
    },
    maintenanceItems: ['']
  })

  const handleEdit = (robotType) => {
    setEditingType(robotType)
    setFormData({
      name: robotType.name,
      description: robotType.description,
      manufacturer: robotType.manufacturer,
      model: robotType.model,
      image: robotType.image,
      specifications: { ...(robotType.specifications || {}) },
      maintenanceItems: [...(robotType.maintenanceItems || [])]
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingType(null)
    setFormData({
      name: '',
      description: '',
      manufacturer: '',
      model: '',
      image: '',
      specifications: {
        height: '',
        weight: '',
        battery: '',
        sensors: ''
      },
      maintenanceItems: ['']
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('Saving robot type with data:', formData)
      }
      
      if (editingType) {
        // Update existing
        if (import.meta.env.DEV) {
          console.log('Updating robot type:', editingType.id)
        }
        const result = await apiService.updateRobotType(editingType.id, formData)
        if (import.meta.env.DEV) {
          console.log('Update result:', result)
        }
        
        if (result.success) {
          if (import.meta.env.DEV) {
            console.log('Update successful, refreshing list')
          }
          // Refresh the entire list to ensure we get the latest data
          await loadRobotTypes()
        } else {
          console.error('Failed to update robot type:', result.error)
          alert('Failed to update robot type: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Add new
        if (import.meta.env.DEV) {
          console.log('Creating new robot type')
        }
        const result = await apiService.createRobotType(formData)
        if (import.meta.env.DEV) {
          console.log('Create result:', result)
        }
        
        if (result.success) {
          if (import.meta.env.DEV) {
            console.log('Create successful, refreshing list')
          }
          await loadRobotTypes()
        } else {
          console.error('Failed to create robot type:', result.error)
          alert('Failed to create robot type: ' + (result.error || 'Unknown error'))
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving robot type:', error)
      alert('Error saving robot type: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Attempting to delete robot type with ID:', id)
      }
      const result = await apiService.deleteRobotType(id)
      if (import.meta.env.DEV) {
        console.log('Delete API response:', result)
      }
      
      if (result.success) {
        if (import.meta.env.DEV) {
          console.log('Delete successful, updating UI')
        }
        setRobotTypes(prev => prev.filter(type => type.id !== id))
        // Refresh the list to ensure consistency
        loadRobotTypes()
      } else {
        console.error('Failed to delete robot type:', result.error)
        alert('Failed to delete robot type: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting robot type:', error)
      alert('Error deleting robot type: ' + error.message)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleMaintenanceItemChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      maintenanceItems: prev.maintenanceItems.map((item, i) => 
        i === index ? value : item
      )
    }))
  }

  const addMaintenanceItem = () => {
    setFormData(prev => ({
      ...prev,
      maintenanceItems: [...prev.maintenanceItems, '']
    }))
  }

  const removeMaintenanceItem = (index) => {
    setFormData(prev => ({
      ...prev,
      maintenanceItems: prev.maintenanceItems.filter((_, i) => i !== index)
    }))
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
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Manage Robots</h1>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Manage Robots</h2>
            <p className="text-sm text-gray-600">Configure different robot models and their maintenance requirements</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Robot Type
          </Button>
        </div>

        {/* Robot Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(robotTypes || []).map((robotType) => (
            <Card key={robotType.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{robotType.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {robotType.manufacturer} - {robotType.model}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(robotType)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(robotType.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Robot Image */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {robotType.image && robotType.image !== '/api/placeholder/200/150' ? (
                      <img 
                        src={robotType.image} 
                        alt={robotType.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600">{robotType.description}</p>

                  {/* Specifications */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Specifications</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Height:</span>
                        <span className="ml-1">{robotType.specifications?.height || ''}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="ml-1">{robotType.specifications?.weight || ''}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Battery:</span>
                        <span className="ml-1">{robotType.specifications?.battery || ''}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sensors:</span>
                        <span className="ml-1">{robotType.specifications?.sensors || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Items */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Maintenance Items</h4>
                    <div className="space-y-1">
                      {(robotType.maintenanceItems || []).slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          • {item}
                        </div>
                      ))}
                      {(robotType.maintenanceItems || []).length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{(robotType.maintenanceItems || []).length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {robotTypes.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <div className="text-gray-500 mb-4">No robot types configured yet.</div>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Robot Type
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit Robot Type' : 'Add New Robot Type'}
            </DialogTitle>
            <DialogDescription>
              Configure the robot specifications and maintenance requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Serial Number</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., RBT-001"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., SB-PRX1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="e.g., RoboTech Industries"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Robot Image (300x400px)</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> robot image
                      </p>
                      <p className="text-xs text-gray-500">PNG or JPG (300x400px recommended)</p>
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => handleInputChange('image', e.target.result)
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Robot preview" 
                      className="w-24 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the robot's capabilities"
                rows={2}
              />
            </div>

            {/* Specifications */}
            <div>
              <Label className="text-base font-medium">Specifications</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.specifications?.height || ''}
                    onChange={(e) => handleInputChange('specifications.height', e.target.value)}
                    placeholder="e.g., 1.2m"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.specifications?.weight || ''}
                    onChange={(e) => handleInputChange('specifications.weight', e.target.value)}
                    placeholder="e.g., 45kg"
                  />
                </div>
                <div>
                  <Label htmlFor="battery">Battery Life</Label>
                  <Input
                    id="battery"
                    value={formData.specifications?.battery || ''}
                    onChange={(e) => handleInputChange('specifications.battery', e.target.value)}
                    placeholder="e.g., 8 hours"
                  />
                </div>
                <div>
                  <Label htmlFor="sensors">Sensors</Label>
                  <Input
                    id="sensors"
                    value={formData.specifications?.sensors || ''}
                    onChange={(e) => handleInputChange('specifications.sensors', e.target.value)}
                    placeholder="e.g., LiDAR, Camera"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Items */}
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-base font-medium">Maintenance Items</Label>
                <Button size="sm" variant="outline" onClick={addMaintenanceItem}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {(formData.maintenanceItems || []).map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => handleMaintenanceItemChange(index, e.target.value)}
                      placeholder="e.g., Display functionality check"
                    />
                    {(formData.maintenanceItems || []).length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMaintenanceItem(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingType ? 'Save Changes' : 'Add Robot Type'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RobotTypes

