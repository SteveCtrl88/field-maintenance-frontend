// Fixed Dashboard component with merge conflict resolution and cleanup

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/auth.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QrCode, User, Calendar, CheckCircle, Clock, AlertCircle, Users, Settings, Plus, MapPin, Eye, UserCheck, LogOut, Edit, AlertTriangle, FileText } from 'lucide-react'
import apiService from '../services/api.js'
import TestInspectionCreator from './TestInspectionCreator.jsx'

const parseInspectionId = (id) => {
  if (!id) return { customerId: null, robotSerial: null }
  const parts = id.split('-')
  if (parts.length >= 4) {
    return { customerId: parts[1], robotSerial: parts.slice(2, parts.length - 1).join('-') }
  }
  return { customerId: parts[1] || null, robotSerial: null }
}

const Dashboard = ({ user, onLogout, onNewMaintenance }) => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [inspections, setInspections] = useState([])
  const [showTestCreator, setShowTestCreator] = useState(false)
  const [customersToVisit, setCustomersToVisit] = useState([])

  const customerMap = useMemo(() => {
    const map = {}
    customers.forEach((c) => {
      const id = c.id || c._id
      if (id) map[id] = c
    })
    return map
  }, [customers])

  const currentUser = user || authService.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'steve@ctrlrobotics.com'

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [customersResponse, inspectionsResponse] = await Promise.all([
        apiService.getCustomers(),
        apiService.getInspections()
      ])

      const customersData = customersResponse?.data || customersResponse?.customers || customersResponse || []
      let inspectionsData = inspectionsResponse?.data || inspectionsResponse?.inspections || inspectionsResponse || []
      const combinedInspections = Array.isArray(inspectionsData) ? inspectionsData : []

      const filteredInspections = isAdmin
        ? combinedInspections
        : combinedInspections.filter(
            (inspection) =>
              inspection.technicianId === currentUser?.id ||
              inspection.technicianId === currentUser?.uid
          )

      const pendingStatuses = ['scheduled', 'in_progress', 'pending']
      const customerKeysToVisit = new Set()
      filteredInspections.forEach((insp) => {
        if (pendingStatuses.includes(insp.status)) {
          if (insp.customerId) customerKeysToVisit.add(insp.customerId)
          if (insp.customer) customerKeysToVisit.add(insp.customer)
          if (insp.customerName) customerKeysToVisit.add(insp.customerName)
        }
      })

      const filteredCustomers = Array.isArray(customersData)
        ? customersData.filter((customer) => {
            const id = customer.id || customer._id
            const name = customer.companyName || customer.name
            return (
              customerKeysToVisit.has(id) ||
              customerKeysToVisit.has(name)
            )
          })
        : []

      filteredInspections.sort((a, b) => {
        const timeA = new Date(a.completedTime || a.date)
        const timeB = new Date(b.completedTime || b.date)
        return timeB - timeA
      })

      setCustomers(customersData)
      setCustomersToVisit(filteredCustomers)
      setInspections(filteredInspections)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setInspections([])
      setCustomers([])
      setCustomersToVisit([])
    }
  }

  // ...rest of the component remains unchanged

  return (
    <div>/* existing JSX layout remains */</div>
  )
}

export default Dashboard