import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Building, Download, Mail, ArrowLeft } from 'lucide-react'
import apiService from '../services/api'
import pdfService from '../services/pdfService'

const InspectionDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiService.getInspection(id)
        if (result.success && result.data) {
          setInspection(result.data)
        } else {
          setInspection(result)
        }
      } catch (err) {
        console.error('Error loading inspection:', err)
        setError('Failed to load inspection')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchData()
    }
  }, [id])

  const handleDownloadPDF = async () => {
    if (!inspection) return
    try {
      await pdfService.generatePDFReport(inspection)
    } catch (err) {
      console.error('PDF generation failed', err)
      alert('Failed to generate PDF')
    }
  }

  const handleEmailReport = () => {
    alert('Email functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading inspection...</p>
      </div>
    )
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Inspection not found'}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Inspection {inspection.id}</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              {inspection.customer || inspection.customerName}
            </CardTitle>
            <CardDescription>Robot {inspection.robotSerial}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {inspection.completedDate || inspection.date} {inspection.completedTime}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {inspection.technicianName || user?.name || 'Technician'}
            </div>
            <Badge className="mt-2">
              {inspection.status ? inspection.status.replace('_', ' ') : 'completed'}
            </Badge>
            {inspection.notes && <div className="mt-2 text-gray-700">{inspection.notes}</div>}
          </CardContent>
        </Card>
        <div className="flex space-x-4">
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleEmailReport}>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </div>
      </main>
    </div>
  )
}

export default InspectionDetail
