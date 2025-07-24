import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, AlertCircle, Loader2, Plus, Users, Bot } from 'lucide-react'
import apiService from '../services/api'
import userService from '../services/userService'

const TestInspectionCreator = ({ onInspectionCreated }) => {
  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [result, setResult] = useState(null)

  // Load customers and technicians on component mount
  useEffect(() => {
    loadCustomers()
    loadTechnicians()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const response = await apiService.getCustomers()
      const customersData = response?.data || response?.customers || response || []
      setCustomers(Array.isArray(customersData) ? customersData : [])
    } catch (error) {
      console.error('Error loading customers:', error)
      setResult({
        success: false,
        message: `Failed to load customers: ${error.message}`
      })
    } finally {
      setLoadingCustomers(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      const result = await userService.getUsers()
      if (result.success) {
        // Filter for technicians only
        const technicianUsers = result.data.filter(user => user.role === 'technician')
        setTechnicians(technicianUsers)
      }
    } catch (error) {
      console.error('Error loading technicians:', error)
      // Set default technician for testing
      setTechnicians([{
        id: 'tech-default',
        name: 'Test Technician',
        email: 'tech@ctrlrobotics.com',
        role: 'technician'
      }])
    }
  }

  const createInspectionsForCustomer = async () => {
    if (!selectedCustomer) {
      setResult({
        success: false,
        message: 'Please select a customer first'
      })
      return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const customer = customers.find(c => c.id === selectedCustomer || c._id === selectedCustomer)
      if (!customer) {
        throw new Error('Selected customer not found')
      }

      const robots = customer.robots || []
      if (robots.length === 0) {
        throw new Error('Selected customer has no robots registered')
      }

      const createdInspections = []
      const errors = []

      // Create an inspection for each robot
      for (const robot of robots) {
        let inspectionData
        try {
          inspectionData = {
            id: `inspection-${customer.id || customer._id}-${robot.serialNumber}-${Date.now()}`,
            robotSerial: robot.serialNumber,
            robotModel: robot.model || robot.type || 'Unknown Model',
            robotId: robot.id || robot._id,
            customerName: customer.companyName || customer.name,
            customerId: customer.id || customer._id,
            customerAddress: customer.address || 'No address provided',
            technicianName: selectedTechnician?.name || 'Unassigned',
            technicianId: selectedTechnician?.id || null,
            overallStatus: 'pending',
            issues: 0,
            notes: `Inspection scheduled for ${robot.serialNumber}`,
            status: 'scheduled',
            type: 'maintenance_inspection',
            scheduledDate: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            startTime: null,
            completedDate: null,
            completedTime: null,
            completedTimeFormatted: null,
            duration: null,
            nextMaintenance: null,
            sessionId: null,
            images: {},
            display_working: false,
            display_working_note: '',
            display_working_img_url: '',
            robot_charging: false,
            robot_charging_note: '',
            robot_charging_img_url: '',
            charger_working: false,
            charger_working_note: '',
            charger_working_img_url: '',
            damage_check: false,
            damage_check_note: '',
            damage_check_img_url: '',
            door_1_working: false,
            door_1_working_note: '',
            door_1_working_img_url: '',
            door_2_working: false,
            door_2_working_note: '',
            door_2_working_img_url: '',
            door_3_working: false,
            door_3_working_note: '',
            door_3_working_img_url: '',
            door_4_working: false,
            door_4_working_note: '',
            door_4_working_img_url: '',
            lte_device: false,
            lte_device_note: '',
            lte_device_img_url: '',
            underside_inspection: false,
            underside_inspection_note: '',
            underside_inspection_img_url: ''
          }

          const response = await apiService.createInspection(inspectionData)
          
          if (response.success) {
            createdInspections.push({
              robotSerial: robot.serialNumber,
              inspectionId: response.data?.id || inspectionData.id
            })
          } else {
            errors.push(`${robot.serialNumber}: ${response.message || 'Unknown error'}`)
          }
        } catch (robotError) {
          errors.push(`${robot.serialNumber}: ${robotError.message}`)
        }

        // Always save to localStorage as backup
        try {
          const existingScheduled = JSON.parse(
            localStorage.getItem('scheduledInspections') || '[]',
          )
          existingScheduled.push(inspectionData)
          localStorage.setItem(
            'scheduledInspections',
            JSON.stringify(existingScheduled),
          )
          if (import.meta.env.DEV) {
            console.log(
              'Saved scheduled inspection to localStorage:',
              inspectionData.id,
            )
          }
        } catch (localError) {
          console.error('Error saving to localStorage:', localError)
        }
      }

      // Show results
      if (createdInspections.length > 0) {
        setResult({
          success: true,
          message: `Successfully created ${createdInspections.length} inspection(s) for ${customer.companyName || customer.name}`,
          data: {
            created: createdInspections,
            errors: errors
          }
        })
        
        if (onInspectionCreated) {
          onInspectionCreated({ customer, inspections: createdInspections })
        }
      } else {
        throw new Error(`Failed to create any inspections. Errors: ${errors.join(', ')}`)
      }
    } catch (error) {
      console.error('Error creating inspections:', error)
      setResult({
        success: false,
        message: `Failed to create inspections: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedCustomerInfo = () => {
    if (!selectedCustomer) return null
    const customer = customers.find(c => c.id === selectedCustomer || c._id === selectedCustomer)
    return customer
  }

  const selectedCustomerInfo = getSelectedCustomerInfo()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Inspections for Customer
        </CardTitle>
        <CardDescription>
          Select a customer to generate inspections for all their robots with 0% completion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-select">Select Customer</Label>
            {loadingCustomers ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading customers...</span>
              </div>
            ) : (
              <Select value={selectedCustomer || ''} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id || customer._id} value={customer.id || customer._id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{customer.companyName || customer.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {customer.robots?.length || 0} robots
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Customer Info */}
          {selectedCustomerInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Customer Details</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div><strong>Company:</strong> {selectedCustomerInfo.companyName || selectedCustomerInfo.name}</div>
                <div><strong>Address:</strong> {selectedCustomerInfo.address || 'No address provided'}</div>
                <div><strong>Robots:</strong> {selectedCustomerInfo.robots?.length || 0}</div>
                {selectedCustomerInfo.robots && selectedCustomerInfo.robots.length > 0 && (
                  <div className="mt-3">
                    <strong>Robot List:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCustomerInfo.robots.map((robot, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          {robot.serialNumber} ({robot.model || robot.type || 'Unknown'})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <div className="flex gap-3">
          <Button
            onClick={createInspectionsForCustomer}
            disabled={loading || !selectedCustomer || loadingCustomers}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Inspection for All Robots
          </Button>
        </div>
        
        {/* Result Display */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{result.message}</span>
            </div>
            {result.data && result.data.created && (
              <div className="mt-3 space-y-2">
                <div className="text-sm font-medium">Created Inspections:</div>
                <div className="flex flex-wrap gap-2">
                  {result.data.created.map((inspection, index) => (
                    <Badge key={index} variant="secondary">
                      {inspection.robotSerial}
                    </Badge>
                  ))}
                </div>
                {result.data.errors && result.data.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-red-700">Errors:</div>
                    <div className="text-xs text-red-600">
                      {result.data.errors.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TestInspectionCreator

