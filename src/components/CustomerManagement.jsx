import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  QrCode, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Bot,
  User,
  Trash2
} from 'lucide-react'
import apiService from '../services/api'

const CustomerManagement = ({ user }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { id, name }

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const result = await apiService.getCustomers()
        
        if (result.success) {
          // Transform API data to match component expectations
          const transformedCustomers = result.data.map(customer => ({
            id: customer.id || customer._id,
            name: customer.name,
            address: customer.address || '',
            contactPerson: customer.contact_person || '',
            phone: customer.phone || '',
            email: customer.email || '',
            profilePicture: customer.profile_picture || '',
            robotCount: (customer.robots && customer.robots.length) || 0,
            technician: customer.inspection_schedule?.assigned_technician || '',
            inspectionFrequency: customer.inspection_schedule ? 
              `${customer.inspection_schedule.week_of_month} ${customer.inspection_schedule.day_of_week}` : '',
            nextInspection: '2025-08-20', // Placeholder
            status: 'active'
          }))
          setCustomers(transformedCustomers)
        } else {
          setError('Failed to load customers')
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        setError('Error loading customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleDeleteCustomer = async (customerId) => {
    try {
      const result = await apiService.deleteCustomer(customerId)
      
      if (result.success) {
        // Remove customer from local state
        setCustomers(prev => prev.filter(customer => customer.id !== customerId))
        setDeleteConfirm(null)
        alert('Customer deleted successfully!')
      } else {
        alert('Failed to delete customer: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error deleting customer: ' + error.message)
    }
  }

  const confirmDelete = (customer) => {
    setDeleteConfirm({ id: customer.id, name: customer.name })
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Customer Management</h1>
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button onClick={() => navigate('/customers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Customer
          </Button>
        </div>

        {/* Customer List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading customers...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">{error}</div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No customers found</div>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      {customer.profilePicture ? (
                        <img 
                          src={customer.profilePicture} 
                          alt={`${customer.name} profile`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {customer.address}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/customers/${customer.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => confirmDelete(customer)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Contact Person</div>
                    <div className="text-sm text-gray-900">{customer.contactPerson}</div>
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {customer.phone}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {customer.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Robots</div>
                    <div className="text-sm text-gray-900 flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      {customer.robotCount} robots
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Assigned to: {customer.technician}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Inspection Schedule</div>
                    <div className="text-sm text-gray-900">{customer.inspectionFrequency}</div>
                    <div className="text-xs text-gray-600 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Next: {customer.nextInspection}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Customer
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
              This action cannot be undone and will also delete all associated robots.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleDeleteCustomer(deleteConfirm.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerManagement

