import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  QrCode,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Bot,
  User,
  Camera,
  Upload,
  Save,
  X,
} from 'lucide-react';
import apiService from '../services/api';

/**
 * Robot types listing and CRUD interface.
 *
 * The component fetches robot types from the API, allows users to add/edit/delete
 * robot types, and ensures IDs are normalised (id or _id).
 * It also cleans up form data before sending to the API to avoid validation errors.
 */
const RobotTypes = ({ user }) => {
  const navigate = useNavigate();
  const [robotTypes, setRobotTypes] = useState([]);

  // Load robot types from API and normalise IDs
  const loadRobotTypes = async () => {
    try {
      const result = await apiService.getRobotTypes();
      if (result.success) {
        // Normalise the ID property: use id if present, otherwise _id
        const processed = (result.data || []).map((rt) => ({
          ...rt,
          id: rt.id || rt._id,
        }));
        setRobotTypes(processed);
      } else {
        console.error('Failed to load robot types:', result.error);
        // Fallback to empty array
        setRobotTypes([]);
      }
    } catch (error) {
      console.error('Error loading robot types:', error);
      setRobotTypes([]);
    }
  };

  useEffect(() => {
    loadRobotTypes();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manufacturer: '',
    model: '',
    image: '',
    specifications: {
      height: '',
      weight: '',
      battery: '',
      sensors: '',
    },
    maintenanceItems: [''],
  });

  // When editing, populate the form with the selected robot type's data
  const handleEdit = (robotType) => {
    setEditingType(robotType);
    setFormData({
      name: robotType.name,
      description: robotType.description,
      manufacturer: robotType.manufacturer,
      model: robotType.model,
      image: robotType.image,
      specifications: { ...(robotType.specifications || {}) },
      maintenanceItems: [...(robotType.maintenanceItems || [])],
    });
    setIsDialogOpen(true);
  };

  // When adding a new robot type, reset the form
  const handleAdd = () => {
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      manufacturer: '',
      model: '',
      image: '',
      specifications: {
        height: '',
        weight: '',
        battery: '',
        sensors: '',
      },
      maintenanceItems: [''],
    });
    setIsDialogOpen(true);
  };

  // Save handler for both create and update
  const handleSave = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('Saving robot type with data:', formData);
      }

      // Filter out empty maintenance items
      const cleanedItems = formData.maintenanceItems.filter(
        (item) => item && item.trim() !== '',
      );

      // Filter out empty specification fields
      const cleanedSpecs = {};
      Object.keys(formData.specifications).forEach((key) => {
        const value = formData.specifications[key];
        if (value && value.trim() !== '') {
          cleanedSpecs[key] = value;
        }
      });

      const payload = {
        ...formData,
        specifications: cleanedSpecs,
        maintenanceItems: cleanedItems,
      };

      if (editingType) {
        // Update existing robot type
        if (import.meta.env.DEV) {
          console.log('Updating robot type:', editingType.id);
        }
        const idToUpdate = editingType.id || editingType._id;
        const result = await apiService.updateRobotType(idToUpdate, payload);
        if (result.success) {
          if (import.meta.env.DEV) {
            console.log('Update successful, refreshing list');
          }
          await loadRobotTypes();
        } else {
          console.error('Failed to update robot type:', result.error);
          alert('Failed to update robot type: ' + (result.error || 'Unknown error'));
        }
      } else {
        // Create new robot type
        if (import.meta.env.DEV) {
          console.log('Creating new robot type');
        }
        const result = await apiService.createRobotType(payload);
        if (result.success) {
          if (import.meta.env.DEV) {
            console.log('Create successful, refreshing list');
          }
          await loadRobotTypes();
        } else {
          console.error('Failed to create robot type:', result.error);
          alert('Failed to create robot type: ' + (result.error || 'Unknown error'));
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving robot type:', error);
      alert('Error saving robot type: ' + error.message);
    }
  };

  // Delete a robot type using its normalised ID
  const handleDelete = async (id) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Attempting to delete robot type with ID:', id);
      }
      const result = await apiService.deleteRobotType(id);
      if (import.meta.env.DEV) {
        console.log('Delete API response:', result);
      }

      if (result.success) {
        if (import.meta.env.DEV) {
          console.log('Delete successful, updating UI');
        }
        setRobotTypes((prev) => prev.filter((type) => type.id !== id));
        // Refresh the list to ensure consistency
        loadRobotTypes();
      } else {
        console.error('Failed to delete robot type:', result.error);
        alert('Failed to delete robot type: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting robot type:', error);
      alert('Error deleting robot type: ' + error.message);
    }
  };

  // Generic handler for form input changes (including nested fields)
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handler for maintenance items array
  const handleMaintenanceItemChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      maintenanceItems: prev.maintenanceItems.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const addMaintenanceItem = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceItems: [...prev.maintenanceItems, ''],
    }));
  };

  const removeMaintenanceItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      maintenanceItems: prev.maintenanceItems.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-xs"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Robot Types
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Robot Types List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {robotTypes.map((robotType) => (
            <Card key={robotType.id}>
              <CardHeader className="flex items-start justify-between space-y-1">
                <div>
                  <CardTitle className="text-base">{robotType.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {robotType.model}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(robotType)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(robotType.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Robot Image */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {robotType.image && robotType.image !== '/api/placeholder/200/150' ? (
                      <img
                        src={robotType.image}
                        alt={robotType.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bot className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600">{robotType.description}</p>

                    {/* Specifications */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Height:</span>
                          <span className="ml-1">
                            {robotType.specifications?.height || ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <span className="ml-1">
                            {robotType.specifications?.weight || ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Battery:</span>
                          <span className="ml-1">
                            {robotType.specifications?.battery || ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sensors:</span>
                          <span className="ml-1">
                            {robotType.specifications?.sensors || ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Maintenance Items
                      </h4>
                      <div className="space-y-1">
                        {(robotType.maintenanceItems || [])
                          .slice(0, 3)
                          .map((item, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              • {item}
                            </div>
                          ))}
                        {(robotType.maintenanceItems || []).length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{(robotType.maintenanceItems || []).length - 3} more
                            items
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {robotTypes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <div className="text-gray-500 mb-4">
                  No robot types configured yet.
                </div>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Robot Type
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingType ? 'Edit Robot Type' : 'Add New Robot Type'}
              </DialogTitle>
              <DialogDescription>
                Configure the robot specifications and maintenance requirements
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Robot Type Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Security Bot Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="e.g., SB-PRX1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    handleInputChange('manufacturer', e.target.value)
                  }
                  placeholder="e.g., RoboTech Industries"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Robot Image (300x400px)</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{' '}
                          robot image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG or JPG (300x400px recommended)
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              handleInputChange('image', ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Robot preview"
                        className="w-24 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe the robot type"
                  rows={3}
                />
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={formData.specifications.height || ''}
                      onChange={(e) =>
                        handleInputChange('specifications.height', e.target.value)
                      }
                      placeholder="e.g., 1.5m"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.specifications.weight || ''}
                      onChange={(e) =>
                        handleInputChange('specifications.weight', e.target.value)
                      }
                      placeholder="e.g., 50kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="battery">Battery</Label>
                    <Input
                      id="battery"
                      value={formData.specifications.battery || ''}
                      onChange={(e) =>
                        handleInputChange('specifications.battery', e.target.value)
                      }
                      placeholder="e.g., 8h"
                    />
                  </div>
                    <div>
                      <Label htmlFor="sensors">Sensors</Label>
                      <Input
                        id="sensors"
                        value={formData.specifications.sensors || ''}
                        onChange={(e) =>
                          handleInputChange('specifications.sensors', e.target.value)
                        }
                        placeholder="e.g., LIDAR, camera"
                      />
                    </div>
                  </div>
                </div>

                {/* Maintenance Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Maintenance Items
                  </h4>
                  <div className="space-y-2">
                    {formData.maintenanceItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={item}
                          onChange={(e) =>
                            handleMaintenanceItemChange(index, e.target.value)
                          }
                          placeholder="Maintenance item"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeMaintenanceItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addMaintenanceItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Dialog Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="default" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Dialog>
      </div>
    );
  };

  export default RobotTypes;
