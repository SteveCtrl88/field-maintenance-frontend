import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrCode, User, Calendar, CheckCircle, Clock, AlertCircle, Users, Settings, Plus, MapPin, Eye, UserCheck, LogOut, Edit, AlertTriangle, FileText } from 'lucide-react'
import apiService from '../services/api.js'
import TestInspectionCreator from './TestInspectionCreator.jsx'

const Dashboard = ({ user, onLogout, onNewMaintenance }) => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [inspections, setInspections] = useState([])
  const [showTestCreator, setShowTestCreator] = useState(false)

  // Get current user and role information from Firebase Auth
  const currentUser = user || authService.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'steve@ctrlrobotics.com'
  const isTechnician = currentUser?.role === 'technician'

  // Load data from API on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      
      // Load customers and inspections in parallel
      const [customersResponse, inspectionsResponse] = await Promise.all([
        apiService.getCustomers(),
        apiService.getInspections()
      ])
      
      // Safely extract data arrays with fallbacks
      const customersData = customersResponse?.data || customersResponse?.customers || customersResponse || []
      let inspectionsData = inspectionsResponse?.data || inspectionsResponse?.inspections || inspectionsResponse || []
      
      // Also load from localStorage for completed inspections and scheduled inspections
      const localReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      const scheduledInspections = JSON.parse(localStorage.getItem('scheduledInspections') || '[]')
      
      // Combine API inspections with local reports and scheduled inspections
      const combinedInspections = [
        ...inspectionsData,
        ...localReports.map(report => ({
          id: report.id,
          robotSerial: report.robotSerial,
          customer: report.customerName,
          date: report.completedDate || new Date(report.completedTime).toLocaleDateString(),
          status: report.status,
          progress: 100,
          type: 'maintenance_inspection',
          completedTime: report.completedTime,
          issues: report.issues || 0,
          photos: report.photos || 0,
          overallStatus: report.overallStatus || 'good'
        })),
        ...scheduledInspections.map(inspection => ({
          id: inspection.id,
          robotSerial: inspection.robotSerial,
          customer: inspection.customerName || inspection.customer,
          date: inspection.date,
          status: inspection.status || 'scheduled',
          progress: inspection.progress || 0,
          type: 'maintenance_inspection',
          technicianId: inspection.technicianId,
          technicianName: inspection.technicianName,
          issues: inspection.issues || 0,
          photos: inspection.photos || 0,
          overallStatus: inspection.overallStatus || 'pending'
        }))
      ]
      
      // Sort by completion time (most recent first)
      combinedInspections.sort((a, b) => {
        const timeA = new Date(a.completedTime || a.date)
        const timeB = new Date(b.completedTime || b.date)
        return timeB - timeA
      })
      
      // Apply role-based filtering directly
      const filteredInspections = isAdmin 
        ? combinedInspections 
        : combinedInspections.filter(inspection => 
            inspection.technicianId === currentUser?.id || 
            inspection.technicianId === currentUser?.uid
          )
      
      // Ensure we have arrays
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setInspections(filteredInspections)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      
      // Load from localStorage as fallback
      const localReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
      setInspections(localReports.map(report => ({
        id: report.id,
        robotSerial: report.robotSerial,
        customer: report.customerName,
        date: report.completedDate || new Date(report.completedTime).toLocaleDateString(),
        status: report.status,
        progress: 100,
        type: 'maintenance_inspection'
      })))
      setCustomers([])
    }
  }

  const handleStartMaintenance = () => {
    onNewMaintenance()
    navigate('/scan')
  }

  const handleEditInspection = (inspectionId) => {
    // Navigate to maintenance checklist with the inspection ID
    navigate(`/maintenance?edit=${inspectionId}`)
  }

  const handleStartInspection = (inspectionId) => {
    navigate(`/maintenance?inspectionId=${inspectionId}`)
  }

  const handleTestInspectionCreated = () => {
    // Refresh dashboard data to show the new inspection
    loadDashboardData()
    setShowTestCreator(false)
  }

  const handleViewCustomer = (customer) => {
    // Ensure we pass the customer ID, not the whole object
    const customerId = customer.id || customer._id
    if (customerId) {
      navigate(`/customers/${customerId}`)
    } else {
      console.error('Customer ID not found:', customer)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">Field Maintenance</h1>
              <h1 className="text-lg font-semibold text-gray-900 sm:hidden">Ctrl</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Admin-only User Management Button */}
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/users')}
                  className="hidden sm:flex text-xs"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Users
                </Button>
              )}
              
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{currentUser?.name || user?.name}</span>
                <Badge variant={isAdmin ? "destructive" : "secondary"}>
                  {currentUser?.role || user?.role}
                </Badge>
              </div>
              <div className="sm:hidden">
                <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs">
                  {currentUser?.role || user?.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Date Display */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm">Start a new maintenance session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleStartMaintenance}
                  className="w-full h-14 sm:h-16 text-base sm:text-lg"
                  size="lg"
                >
                  <QrCode className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Scan Robot QR Code
                </Button>
                <Button 
                  onClick={() => setShowTestCreator(true)}
                  variant="outline"
                  className="w-full h-12 text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Inspection
                </Button>
                <p className="text-xs sm:text-sm text-gray-600 text-center">
                  Scan the QR code on the robot to begin maintenance
                </p>
              </CardContent>
            </Card>

            {/* Management Actions */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Management</CardTitle>
                <CardDescription className="text-sm">Manage customers and system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-sm sm:text-base"
                  onClick={() => navigate('/customers')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Customer Management
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-sm sm:text-base"
                  onClick={() => navigate('/robot-types')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Robots
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-sm sm:text-base"
                  onClick={() => navigate('/customers/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
                {user?.role === 'admin' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 text-sm sm:text-base"
                      onClick={() => navigate('/users')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      User Management
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 text-sm sm:text-base"
                      onClick={() => navigate('/reports')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">3</div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600">1</div>
                    <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customers to Visit & Recent Maintenance */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* Customers to Visit */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Customers to Visit</CardTitle>
                <CardDescription className="text-sm">Upcoming scheduled maintenance visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(customers) && customers.length > 0 ? customers.slice(0, 3).map((customer) => {
                    // Calculate days until next inspection
                    const today = new Date()
                    const nextInspection = customer.inspection_schedule?.next_inspection ? new Date(customer.inspection_schedule.next_inspection) : null
                    const daysUntil = nextInspection ? Math.ceil((nextInspection - today) / (1000 * 60 * 60 * 24)) : null
                    
                    return (
                      <div key={customer.id} className={`p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors ${daysUntil !== null && daysUntil < 0 ? 'border-red-200 bg-red-50' : ''}`}>
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-full ${daysUntil !== null && daysUntil < 0 ? 'bg-red-100' : daysUntil === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                                <MapPin className={`h-3 w-3 ${daysUntil !== null && daysUntil < 0 ? 'text-red-600' : daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                              </div>
                              <div className="font-medium text-sm">{customer.name}</div>
                            </div>
                            <div className={`text-xs font-medium px-2 py-1 rounded ${daysUntil !== null && daysUntil < 0 ? 'text-red-600 bg-red-100' : daysUntil === 0 ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'}`}>
                              {daysUntil !== null ? (daysUntil < 0 ? 'OVERDUE' : daysUntil === 0 ? 'TODAY' : `${daysUntil} days`) : 'Not scheduled'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{customer.address}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {customer.robots?.length || 0} robots • {customer.inspection_schedule?.assigned_technician || 'Unassigned'}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)} className="h-8 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        
                        {/* Desktop Layout */}
                        <div className="hidden sm:flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${daysUntil !== null && daysUntil < 0 ? 'bg-red-100' : daysUntil === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                              <MapPin className={`h-4 w-4 ${daysUntil !== null && daysUntil < 0 ? 'text-red-600' : daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-600">{customer.address}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {customer.robots?.length || 0} robots • Assigned to {customer.inspection_schedule?.assigned_technician || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className={`text-sm font-medium ${daysUntil !== null && daysUntil < 0 ? 'text-red-600' : daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {daysUntil !== null ? (daysUntil < 0 ? 'OVERDUE' : daysUntil === 0 ? 'TODAY' : `${daysUntil} days`) : 'Not scheduled'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {nextInspection ? nextInspection.toISOString().split('T')[0] : 'No date set'}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming visits scheduled</p>
                      <p className="text-sm">Add customers to see scheduled maintenance visits</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Maintenance */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Recent Maintenance</CardTitle>
                <CardDescription className="text-sm">Your recent maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {Array.isArray(inspections) && inspections.length > 0 ? inspections.map((item) => (
                    <div key={item.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <div>
                              <div className="font-medium text-sm">{item.robotSerial}</div>
                              <div className="text-xs text-gray-600">{item.customer}</div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(item.status)} text-xs`}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.date}
                          </div>
                          {item.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditInspection(item.id)}
                              className="h-8 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {item.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleStartInspection(item.id)}
                              className="h-8 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                        {item.status === 'in_progress' && (
                          <div className="text-xs text-blue-600 mt-2">
                            Progress: {item.progress}%
                          </div>
                        )}
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(item.status)}
                          <div>
                            <div className="font-medium">{item.robotSerial}</div>
                            <div className="text-sm text-gray-600">{item.customer}</div>
                            {item.status === 'in_progress' && (
                              <div className="text-xs text-blue-600 mt-1">
                                Progress: {item.progress}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {item.date}
                            </div>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          {item.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditInspection(item.id)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {item.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleStartInspection(item.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start Inspection
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No recent maintenance activities</p>
                      <p className="text-xs text-gray-400 mt-1">Start a new maintenance session to see activities here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Test Inspection Creator Dialog */}
      <Dialog open={showTestCreator} onOpenChange={setShowTestCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Test Inspection</DialogTitle>
            <DialogDescription>
              Create test inspections to verify dashboard functionality and database connectivity
            </DialogDescription>
          </DialogHeader>
          <TestInspectionCreator onInspectionCreated={handleTestInspectionCreated} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard

