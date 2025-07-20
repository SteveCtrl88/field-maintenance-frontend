import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Building, Calendar, MapPin, User } from 'lucide-react'

const RobotConfirmation = ({ robot, onConfirm, user }) => {
  const navigate = useNavigate()

  const handleConfirm = () => {
    onConfirm()
    navigate('/maintenance')
  }

  const handleGoBack = () => {
    navigate('/scan')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Confirm Robot</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Robot Found Alert */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">Robot found in database!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Please verify this is the correct robot before starting maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Robot Image */}
            <Card>
              <CardHeader>
                <CardTitle>Robot Image</CardTitle>
                <CardDescription>Visual confirmation of the robot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Robot Image</p>
                    <p className="text-gray-500 text-xs">{robot.model}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Robot Details */}
            <Card>
              <CardHeader>
                <CardTitle>Robot Details</CardTitle>
                <CardDescription>Verify the robot information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Serial Number</p>
                    <p className="text-lg font-mono">{robot.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Model</p>
                    <p className="text-lg">{robot.model}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Manufacturer</p>
                  <p className="text-base">{robot.manufacturer}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-base">{robot.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Maintenance</p>
                    <p className="text-base">{robot.lastMaintenance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
              <CardDescription>Robot owner and contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-lg font-medium">{robot.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-base">{robot.customer.contact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base">{robot.customer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Session Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Maintenance Session</CardTitle>
              <CardDescription className="text-blue-700">
                Session will be started for technician: {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Time:</strong> {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  Ready to Start
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wrong Robot - Go Back
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirm & Start Maintenance
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RobotConfirmation

