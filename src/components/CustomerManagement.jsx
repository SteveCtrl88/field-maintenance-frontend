import { useState } from 'react'
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
  User
} from 'lucide-react'

const CustomerManagement = ({ user }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock customer data
  const customers = [
    {
      id: 1,
      name: 'Acme Corporation',
      address: '123 Business Ave, New York, NY 10001',
      contactPerson: 'John Doe',
      phone: '+1 (555) 123-4567',
      email: 'maintenance@acme.com',
      robotCount: 3,
      technician: 'John Smith',
      inspectionFrequency: '3rd Wednesday',
      nextInspection: '2025-08-20',
      status: 'active'
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      address: '456 Innovation Blvd, San Francisco, CA 94105',
      contactPerson: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      email: 'support@techsolutions.com',
      robotCount: 2,
      technician: 'John Smith',
      inspectionFrequency: '1st Monday',
      nextInspection: '2025-08-05',
      status: 'active'
    },
    {
      id: 3,
      name: 'Global Industries',
      address: '789 Corporate Dr, Chicago, IL 60601',
      contactPerson: 'Mike Johnson',
      phone: '+1 (555) 456-7890',
      email: 'facilities@globalind.com',
      robotCount: 5,
      technician: 'Sarah Wilson',
      inspectionFrequency: '2nd Friday',
      nextInspection: '2025-08-09',
      status: 'active'
    }
  ]

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
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {customer.address}
                    </CardDescription>
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
                      onClick={() => navigate(`/customers/${customer.id}/edit`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
              </div>
              <Button onClick={() => navigate('/customers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default CustomerManagement

