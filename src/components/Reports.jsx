import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, Eye, Search, Filter, Calendar, User, Building } from 'lucide-react'

const Reports = ({ user }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCustomer, setFilterCustomer] = useState('all')

  // Read completed reports from localStorage
  const [reports, setReports] = useState([])

  useEffect(() => {
    const loadReports = () => {
      try {
        const storedReports = JSON.parse(localStorage.getItem('maintenanceReports') || '[]')
        // If no real reports, show mock data for demo
        if (storedReports.length === 0) {
          setReports([
            {
              id: 'RPT-001',
              customer: 'Acme Corporation',
              customerAddress: '123 Business Ave, New York, NY',
              robotSerial: 'RBT-001',
              robotModel: 'ServiceBot Pro X1',
              technician: 'John Smith',
              completedDate: '2025-07-18',
              completedTime: '14:30',
              duration: '45 minutes',
              status: 'completed',
              issues: 2,
              photos: 5,
              notes: 'Minor wear on door mechanism, replaced charging cable',
              overallStatus: 'good',
              nextMaintenance: '2025-08-18'
            },
            {
              id: 'RPT-002',
              customer: 'Tech Solutions Inc',
              customerAddress: '456 Innovation Blvd, San Francisco, CA',
              robotSerial: 'RBT-045',
              robotModel: 'ServiceBot Pro X2',
              technician: 'Sarah Wilson',
              completedDate: '2025-07-17',
              completedTime: '10:15',
              duration: '32 minutes',
              status: 'completed',
              issues: 0,
              photos: 3,
              notes: 'All systems functioning normally, no issues found',
              overallStatus: 'excellent',
              nextMaintenance: '2025-08-17'
            }
          ])
        } else {
          setReports(storedReports)
        }
      } catch (error) {
        console.error('Error loading reports:', error)
        setReports([])
      }
    }

    loadReports()
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.robotSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.technician.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || report.overallStatus === filterStatus
    const matchesCustomer = filterCustomer === 'all' || report.customer === filterCustomer
    
    return matchesSearch && matchesStatus && matchesCustomer
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownloadPDF = (report) => {
    // Generate PDF content as HTML
    const pdfContent = generatePDFContent(report)
    
    // Create and download PDF as HTML file (in a real app, you'd use a proper PDF library like jsPDF)
    const blob = new Blob([pdfContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maintenance-report-${report.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePDFContent = (report) => {
    // Generate a formatted HTML report
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance Report ${report.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-excellent { background-color: #d4edda; color: #155724; }
        .status-good { background-color: #cce7ff; color: #004085; }
        .status-fair { background-color: #fff3cd; color: #856404; }
        .status-poor { background-color: #f8d7da; color: #721c24; }
        .notes { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">ctrl</div>
        <h1>MAINTENANCE REPORT</h1>
        <p>Report ID: ${report.id}</p>
    </div>

    <div class="info-grid">
        <div class="section">
            <h3>INSPECTION DETAILS</h3>
            <div class="info-item"><span class="label">Date:</span> ${report.completedDate || new Date().toLocaleDateString()}</div>
            <div class="info-item"><span class="label">Time:</span> ${report.completedTimeFormatted || report.completedTime}</div>
            <div class="info-item"><span class="label">Duration:</span> ${report.duration}</div>
            <div class="info-item"><span class="label">Technician:</span> ${report.technicianName || report.technician}</div>
        </div>

        <div class="section">
            <h3>CUSTOMER INFORMATION</h3>
            <div class="info-item"><span class="label">Company:</span> ${report.customer}</div>
            <div class="info-item"><span class="label">Address:</span> ${report.customerAddress}</div>
        </div>
    </div>

    <div class="section">
        <h3>ROBOT INFORMATION</h3>
        <div class="info-item"><span class="label">Serial Number:</span> ${report.robotSerial}</div>
        <div class="info-item"><span class="label">Model:</span> ${report.robotModel}</div>
    </div>

    <div class="section">
        <h3>INSPECTION RESULTS</h3>
        <div class="info-item">
            <span class="label">Overall Status:</span> 
            <span class="status status-${report.overallStatus}">${(report.overallStatus || 'unknown').toUpperCase()}</span>
        </div>
        <div class="info-item"><span class="label">Issues Found:</span> ${report.issues || 0}</div>
        <div class="info-item"><span class="label">Photos Taken:</span> ${report.photos || 0}</div>
    </div>

    <div class="section">
        <h3>NOTES</h3>
        <div class="notes">${report.notes || 'No additional notes'}</div>
    </div>

    <div class="section">
        <h3>NEXT MAINTENANCE</h3>
        <div class="info-item"><span class="label">Scheduled:</span> ${report.nextMaintenance}</div>
    </div>

    <div class="section" style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Ctrl Field Maintenance System</p>
    </div>
</body>
</html>
    `
  }

  const uniqueCustomers = [...new Set(reports.map(r => r.customer))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="bg-white p-2 rounded-lg mr-3 border">
                <img src="/ctrl-logo.png" alt="Ctrl" className="h-6 w-auto" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Maintenance Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <Badge variant="outline">admin</Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
            <CardDescription>Search and filter completed maintenance reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer, robot, or technician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map(customer => (
                    <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                {filteredReports.length} of {reports.length} reports
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Report Info */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{report.id}</h3>
                        <Badge className={getStatusColor(report.overallStatus)}>
                          {report.overallStatus}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {report.completedDate} at {report.completedTime}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {report.technician}
                        </div>
                        <div>Duration: {report.duration}</div>
                      </div>
                    </div>

                    {/* Customer & Robot Info */}
                    <div>
                      <h4 className="font-medium mb-2">Customer & Robot</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          {report.customer}
                        </div>
                        <div>{report.customerAddress}</div>
                        <div className="font-medium">{report.robotSerial}</div>
                        <div>{report.robotModel}</div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Issues: {report.issues}</div>
                        <div>Photos: {report.photos}</div>
                        <div>Next: {report.nextMaintenance}</div>
                        <div className="text-xs mt-2 bg-gray-50 p-2 rounded">
                          {report.notes}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadPDF(report)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reports found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default Reports

