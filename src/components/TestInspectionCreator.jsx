import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import apiService from '../services/api'

const TestInspectionCreator = ({ onInspectionCreated }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    robotSerial: 'RBT-TEST-' + Math.floor(Math.random() * 1000),
    robotModel: 'Test Model X1',
    customerName: 'Test Customer Corp',
    customerAddress: '123 Test Street, Test City',
    technicianName: 'Test Technician',
    overallStatus: 'good',
    issues: 0,
    photos: 2,
    notes: 'Test inspection created for dashboard verification'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateTestInspection = () => {
    const now = new Date()
    const completedTime = now.toISOString()
    const completedDate = now.toLocaleDateString()
    const completedTimeFormatted = now.toLocaleTimeString()
    
    return {
      id: `TEST-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      robotId: `robot-${Date.now()}`,
      robotSerial: formData.robotSerial,
      robotModel: formData.robotModel,
      customerId: `customer-${Date.now()}`,
      customerName: formData.customerName,
      customerAddress: formData.customerAddress,
      technicianId: `tech-${Date.now()}`,
      technicianName: formData.technicianName,
      startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      completedTime: completedTime,
      completedDate: completedDate,
      completedTimeFormatted: completedTimeFormatted,
      duration: '30 minutes',
      responses: {
        display_working: 'yes',
        robot_charging: 'yes',
        charger_working: 'yes',
        damage_check: formData.issues > 0 ? 'yes' : 'no',
        door_1: 'yes',
        door_2: 'yes',
        door_3: 'yes',
        door_4: 'yes',
        lte_device: 'yes',
        underside_inspection: 'yes'
      },
      images: {
        damage_check: formData.photos > 0 ? [
          {
            id: `img_${Date.now()}_1`,
            questionId: 'damage_check',
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            filename: `test_image_${Date.now()}.jpg`,
            timestamp: completedTime,
            note: 'Test image for verification',
            uploadedToFirebase: false,
            size: 1024
          }
        ] : [],
        underside_inspection: [
          {
            id: `img_${Date.now()}_2`,
            questionId: 'underside_inspection',
            url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            filename: `test_underside_${Date.now()}.jpg`,
            timestamp: completedTime,
            note: 'Underside inspection completed',
            uploadedToFirebase: false,
            size: 1024
          }
        ]
      },
      notes: {
        underside_inspection: formData.notes,
        damage_check: formData.issues > 0 ? 'Minor wear detected' : ''
      },
      status: 'completed',
      issues: parseInt(formData.issues),
      photos: parseInt(formData.photos),
      overallStatus: formData.overallStatus,
      nextMaintenance: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 90 days from now
      type: 'maintenance_inspection'
    }
  }

  const handleCreateInspection = async () => {
    setIsCreating(true)
    setResult(null)
    
    try {
      const inspectionData = generateTestInspection()
      
      // Try to create via API
      const response = await apiService.createInspection(inspectionData)
      
      if (response.success) {
        setResult({
          success: true,
          message: 'Test inspection created successfully in database!',
          data: response.data
        })
        
        // Also save to localStorage for immediate dashboard update
        const existingReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
        existingReports.push(inspectionData)
        localStorage.setItem('maintenanceReports', JSON.stringify(existingReports))
        
        if (onInspectionCreated) {
          onInspectionCreated(inspectionData)
        }
      } else {
        throw new Error(response.message || 'Failed to create inspection')
      }
    } catch (error) {
      console.error('Error creating test inspection:', error)
      
      // Fallback to localStorage only
      const inspectionData = generateTestInspection()
      const existingReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      existingReports.push(inspectionData)
      localStorage.setItem('maintenanceReports', JSON.stringify(existingReports))
      
      setResult({
        success: false,
        message: `API failed (${error.message}), but inspection saved locally for testing`,
        data: inspectionData
      })
      
      if (onInspectionCreated) {
        onInspectionCreated(inspectionData)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleQuickCreate = () => {
    // Generate random data for quick testing
    setFormData({
      robotSerial: 'RBT-QUICK-' + Math.floor(Math.random() * 1000),
      robotModel: ['Model X1', 'Model Y2', 'Model Z3'][Math.floor(Math.random() * 3)],
      customerName: ['Acme Corp', 'TechCo Industries', 'Global Systems'][Math.floor(Math.random() * 3)],
      customerAddress: ['123 Main St', '456 Oak Ave', '789 Pine Rd'][Math.floor(Math.random() * 3)],
      technicianName: ['John Smith', 'Sarah Johnson', 'Mike Wilson'][Math.floor(Math.random() * 3)],
      overallStatus: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
      issues: Math.floor(Math.random() * 3),
      photos: Math.floor(Math.random() * 5) + 1,
      notes: 'Automated test inspection for dashboard verification'
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Test Inspection Creator
        </CardTitle>
        <CardDescription>
          Create test inspections to verify dashboard functionality and database connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="robotSerial">Robot Serial</Label>
            <Input
              id="robotSerial"
              value={formData.robotSerial}
              onChange={(e) => handleInputChange('robotSerial', e.target.value)}
              placeholder="RBT-TEST-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="robotModel">Robot Model</Label>
            <Input
              id="robotModel"
              value={formData.robotModel}
              onChange={(e) => handleInputChange('robotModel', e.target.value)}
              placeholder="Model X1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Test Customer Corp"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technicianName">Technician Name</Label>
            <Input
              id="technicianName"
              value={formData.technicianName}
              onChange={(e) => handleInputChange('technicianName', e.target.value)}
              placeholder="Test Technician"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="overallStatus">Overall Status</Label>
            <Select value={formData.overallStatus} onValueChange={(value) => handleInputChange('overallStatus', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issues">Number of Issues</Label>
            <Input
              id="issues"
              type="number"
              min="0"
              max="10"
              value={formData.issues}
              onChange={(e) => handleInputChange('issues', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customerAddress">Customer Address</Label>
          <Input
            id="customerAddress"
            value={formData.customerAddress}
            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
            placeholder="123 Test Street, Test City"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Test inspection notes..."
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleQuickCreate}
            variant="outline"
            className="flex-1"
          >
            Generate Random Data
          </Button>
          
          <Button
            onClick={handleCreateInspection}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Inspection
              </>
            )}
          </Button>
        </div>
        
        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className={result.success ? 'text-green-800' : 'text-orange-800'}>
              {result.message}
              {result.data && (
                <div className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    ID: {result.data.id}
                  </Badge>
                  <Badge variant="outline">
                    Serial: {result.data.robotSerial}
                  </Badge>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default TestInspectionCreator

