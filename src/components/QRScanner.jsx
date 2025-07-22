import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, Camera, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import apiService from '../services/api'

const QRScanner = ({ onRobotScanned, user }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [manualSerial, setManualSerial] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [robots, setRobots] = useState([])
  const navigate = useNavigate()

  // Load robots from Firebase on component mount
  useEffect(() => {
    loadRobots()
  }, [])

  const loadRobots = async () => {
    try {
      const result = await apiService.getRobots()
      if (result.success && result.data) {
        setRobots(result.data)
      } else {
        console.error('Failed to load robots:', result.message)
        // Fallback to demo data if API fails
        setRobots([
          {
            id: 'demo-1',
            serialNumber: 'RBT-001',
            model: 'ServiceBot Pro X1',
            manufacturer: 'RoboTech Industries',
            customer: {
              name: 'Acme Corporation',
              email: 'maintenance@acme.com',
              contact: 'John Doe'
            },
            location: 'Building A - Floor 2',
            installDate: '2024-03-15',
            lastMaintenance: '2025-06-15',
            image: '/api/placeholder/300/200'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading robots:', error)
      setError('Failed to load robot database. Using demo data.')
    }
  }

  const simulateQRScan = () => {
    setIsScanning(true)
    setError('')
    
    // Simulate camera scanning delay
    setTimeout(() => {
      // Randomly select a robot for demo
      if (robots.length > 0) {
        const randomRobot = robots[Math.floor(Math.random() * robots.length)]
        handleRobotFound(randomRobot.serialNumber)
      } else {
        setError('No robots available in database')
      }
      setIsScanning(false)
    }, 2000)
  }

  const handleManualEntry = async (e) => {
    e.preventDefault()
    if (!manualSerial.trim()) return
    
    setIsLoading(true)
    setError('')
    
    // Simulate API lookup delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    handleRobotFound(manualSerial.trim())
    setIsLoading(false)
  }

  const handleRobotFound = (serialNumber) => {
    const robot = robots.find(r => 
      r.serialNumber?.toLowerCase() === serialNumber.toLowerCase() ||
      r.serial_number?.toLowerCase() === serialNumber.toLowerCase()
    )
    
    if (robot) {
      // Normalize robot data structure
      const normalizedRobot = {
        id: robot.id || robot._id,
        serialNumber: robot.serialNumber || robot.serial_number,
        model: robot.model || robot.type || 'Unknown Model',
        manufacturer: robot.manufacturer || 'Unknown Manufacturer',
        customer: robot.customer || {
          name: robot.customerName || 'Unknown Customer',
          email: robot.customerEmail || '',
          contact: robot.customerContact || ''
        },
        customerId: robot.customerId || robot.customer_id,
        customerName: robot.customerName || robot.customer?.name || robot.customer?.companyName,
        location: robot.location || 'Unknown Location',
        installDate: robot.installDate || robot.installation_date || 'Unknown',
        lastMaintenance: robot.lastMaintenance || robot.last_maintenance || 'Never',
        image: robot.image || '/api/placeholder/300/200'
      }
      
      onRobotScanned(normalizedRobot)
      navigate('/confirm-robot')
    } else {
      setError(`Robot with serial number "${serialNumber}" not found in database`)
    }
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
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <QrCode className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Scan Robot QR Code</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* QR Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Camera Scanner
              </CardTitle>
              <CardDescription>
                Point your camera at the robot's QR code to scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  {isScanning ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600">Scanning QR code...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <QrCode className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Camera viewfinder will appear here</p>
                      <Button onClick={simulateQRScan} disabled={isScanning}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera Scan
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Make sure the QR code is clearly visible and well-lit
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Enter the robot serial number manually if QR scanning isn't working
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serial">Robot Serial Number</Label>
                  <Input
                    id="serial"
                    placeholder="e.g., RBT-001"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !manualSerial.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Looking up robot...
                    </>
                  ) : (
                    'Find Robot'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Demo Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Demo Mode - Available Robot Serial Numbers:</p>
                <div className="space-y-1">
                  {mockRobots.map(robot => (
                    <p key={robot.id}>
                      <code className="bg-blue-100 px-2 py-1 rounded">{robot.serialNumber}</code> - {robot.model}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default QRScanner

