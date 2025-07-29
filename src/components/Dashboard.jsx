import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.js';
import apiService from '../services/api.js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

/**
 * Basic dashboard implementation to replace the placeholder.
 * Displays customer/inspection counts and a greeting, and lets the
 * user start a new maintenance session.
 */
const Dashboard = ({ user, onLogout, onNewMaintenance }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [inspections, setInspections] = useState([]);
  const currentUser = user || authService.getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersResponse, inspectionsResponse] = await Promise.all([
          apiService.getCustomers(),
          apiService.getInspections?.() ?? Promise.resolve([]),
        ]);
        const customersData =
          customersResponse?.data ||
          customersResponse?.customers ||
          customersResponse ||
          [];
        const inspectionsData =
          inspectionsResponse?.data ||
          inspectionsResponse?.inspections ||
          inspectionsResponse ||
          [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setInspections(Array.isArray(inspectionsData) ? inspectionsData : []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadData();
  }, []);

  const handleStartMaintenance = () => {
    if (onNewMaintenance) onNewMaintenance();
    navigate('/scan');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">
        Welcome, {currentUser?.name || currentUser?.email || 'user'}!
      </p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
            <CardDescription>
              {customers.length} registered{' '}
              {customers.length === 1 ? 'customer' : 'customers'}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Inspections</CardTitle>
            <CardDescription>
              {inspections.length}{' '}
              {inspections.length === 1 ? 'inspection' : 'inspections'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="mt-8">
        <Button onClick={handleStartMaintenance}>Start New Maintenance</Button>
      </div>
    </div>
  );
};

export default Dashboard;
