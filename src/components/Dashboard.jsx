import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrCode, User, Calendar, CheckCircle, Clock, AlertCircle, Users, Settings, Plus, MapPin, Eye, UserCheck, LogOut, Edit, AlertTriangle, FileText } from 'lucide-react'
import apiService from '../services/api.js'
import authService from '../services/auth.js'

const Dashboard = ({ user, onLogout, onNewMaintenance }) => {
  const navigate = useNavigate()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load data from API on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load customers and inspections in parallel
      const [customersResponse, inspectionsResponse] = await Promise.all([
        apiService.getCustomers(),
        apiService.getInspections()
      ])
      
      // Safely extract data arrays with fallbacks
      const customersData = customersResponse?.data || customersResponse?.customers || customersResponse || []
      const inspectionsData = inspectionsResponse?.data || inspectionsResponse?.inspections || inspectionsResponse || []
      
      // Ensure we have arrays
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setInspections(Array.isArray(inspectionsData) ? inspectionsData : [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
      
      // Set empty arrays on error
      setCustomers([])
      setInspections([])
    } finally {
      setLoading(false)
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

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setIsCustomerModalOpen(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />
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
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div className="sm:hidden">
                <Badge variant="secondary" className="text-xs">{user.role}</Badge>
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
                  {[
                    {
                      id: 1,
                      customer: 'Acme Corporation',
                      address: '123 Business Ave, New York, NY',
                      robots: 3,
                      daysUntil: 0,
                      scheduled: '2025-07-20',
                      technician: 'John Smith'
                    },
                    {
                      id: 2,
                      customer: 'Tech Solutions Inc',
                      address: '456 Innovation Blvd, San Francisco, CA',
                      robots: 2,
                      daysUntil: 2,
                      scheduled: '2025-07-22',
                      technician: 'John Smith'
                    },
                    {
                      id: 3,
                      customer: 'Global Industries',
                      address: '789 Corporate Dr, Chicago, IL',
                      robots: 5,
                      daysUntil: -1,
                      scheduled: '2025-07-19',
                      technician: 'Sarah Wilson'
                    }
                  ].map((visit) => (
                    <div key={visit.id} className={`p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors ${visit.daysUntil < 0 ? 'border-red-200 bg-red-50' : ''}`}>
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-full ${visit.daysUntil < 0 ? 'bg-red-100' : visit.daysUntil === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                              <MapPin className={`h-3 w-3 ${visit.daysUntil < 0 ? 'text-red-600' : visit.daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>
                            <div className="font-medium text-sm">{visit.customer}</div>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${visit.daysUntil < 0 ? 'text-red-600 bg-red-100' : visit.daysUntil === 0 ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'}`}>
                            {visit.daysUntil < 0 ? 'OVERDUE' : visit.daysUntil === 0 ? 'TODAY' : `${visit.daysUntil} days`}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{visit.address}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {visit.robots} robots • {visit.technician}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewCustomer(visit)} className="h-8 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${visit.daysUntil < 0 ? 'bg-red-100' : visit.daysUntil === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <MapPin className={`h-4 w-4 ${visit.daysUntil < 0 ? 'text-red-600' : visit.daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <div className="font-medium">{visit.customer}</div>
                            <div className="text-sm text-gray-600">{visit.address}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {visit.robots} robots • Assigned to {visit.technician}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${visit.daysUntil < 0 ? 'text-red-600' : visit.daysUntil === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                              {visit.daysUntil < 0 ? 'OVERDUE' : visit.daysUntil === 0 ? 'TODAY' : `${visit.daysUntil} days`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {visit.scheduled}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewCustomer(visit)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* Customer Detail Modal */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">Customer Visit Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about the scheduled maintenance visit
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4 sm:space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm sm:text-base">Company:</span>
                      <div className="text-sm sm:text-base text-gray-700 mt-1">{selectedCustomer.customer}</div>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">Address:</span>
                      <div className="mt-1">
                        <div className="text-sm text-gray-700 mb-2">{selectedCustomer.address}</div>
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(selectedCustomer.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Open in Google Maps
                        </a>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">Robots:</span>
                      <div className="text-sm sm:text-base text-gray-700 mt-1">{selectedCustomer.robots} units</div>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">Assigned Technician:</span>
                      <div className="text-sm sm:text-base text-gray-700 mt-1">{selectedCustomer.technician}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Visit Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm sm:text-base">Scheduled Date:</span>
                      <div className="text-sm sm:text-base text-gray-700 mt-1">{selectedCustomer.scheduled}</div>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">Status:</span>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedCustomer.daysUntil < 0 
                            ? 'bg-red-100 text-red-800' 
                            : selectedCustomer.daysUntil === 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedCustomer.daysUntil < 0 ? 'OVERDUE' : selectedCustomer.daysUntil === 0 ? 'TODAY' : `${selectedCustomer.daysUntil} days remaining`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm sm:text-base">Visit Type:</span>
                      <div className="text-sm sm:text-base text-gray-700 mt-1">Preventative Maintenance</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsCustomerModalOpen(false)
                    navigate('/scan')
                  }}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Start Maintenance
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard

