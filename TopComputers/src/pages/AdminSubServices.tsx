import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useServices } from '../contexts/ServicesContext';
import type { SubService, SubServiceFormData, MainService } from '../types/services';
import SingleImageUpload from '../components/SingleImageUpload';

const AdminSubServices: React.FC = () => {
  const { mainServices, subServices, addSubService, updateSubService, deleteSubService } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingSubService, setEditingSubService] = useState<SubService | null>(null);
  const [selectedMainService, setSelectedMainService] = useState<MainService | null>(null);
  const [formData, setFormData] = useState<SubServiceFormData>({
    mainServiceId: '',
    title: '',
    description: '',
    image: '',
    whatsappMessage: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubService) {
        await updateSubService(editingSubService.id, formData);
      } else {
        await addSubService(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving sub-service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      mainServiceId: '',
      title: '',
      description: '',
      image: '',
      whatsappMessage: '',
      isActive: true,
    });
    setEditingSubService(null);
    setShowForm(false);
    setSelectedMainService(null);
  };

  const handleEdit = (subService: SubService) => {
    const mainService = mainServices.find(s => s.id === subService.mainServiceId);
    setFormData({
      mainServiceId: subService.mainServiceId,
      title: subService.title,
      description: subService.description,
      image: subService.image,
      whatsappMessage: subService.whatsappMessage,
      isActive: subService.isActive,
    });
    setEditingSubService(subService);
    setSelectedMainService(mainService || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-service?')) {
      try {
        await deleteSubService(id);
      } catch (error) {
        console.error('Error deleting sub-service:', error);
      }
    }
  };

  const handleAddNew = (mainService: MainService) => {
    setFormData({
      mainServiceId: mainService.id,
      title: '',
      description: '',
      image: '',
      whatsappMessage: '',
      isActive: true,
    });
    setSelectedMainService(mainService);
    setShowForm(true);
  };

  const getSubServicesForMainService = (mainServiceId: string) => {
    return subServices.filter(sub => sub.mainServiceId === mainServiceId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Manage Sub-Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add, edit, and manage sub-services for each main service
          </p>
        </div>

        {/* Main Services List */}
        <div className="space-y-8">
          {mainServices.map((mainService) => {
            const serviceSubServices = getSubServicesForMainService(mainService.id);
            
            return (
              <motion.div
                key={mainService.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                {/* Main Service Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={mainService.image || '/placeholder-service.jpg'}
                          alt={mainService.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {mainService.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {serviceSubServices.length} sub-services
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddNew(mainService)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sub-Service
                    </button>
                  </div>
                </div>

                {/* Sub-Services List */}
                <div className="p-6">
                  {serviceSubServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {serviceSubServices.map((subService) => (
                        <motion.div
                          key={subService.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          {/* Sub-Service Image */}
                          <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                            <img
                              src={subService.image || '/placeholder-service.jpg'}
                              alt={subService.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Sub-Service Content */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {subService.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                subService.isActive 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {subService.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                              {subService.description}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(subService)}
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subService.id)}
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No sub-services yet for {mainService.title}
                      </p>
                      <button
                        onClick={() => handleAddNew(mainService)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Sub-Service
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State - No Main Services */}
        {mainServices.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Main Services Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to add main services first before creating sub-services
            </p>
            <a
              href="/admin/services"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Main Services
            </a>
          </div>
        )}

        {/* Sub-Service Form Modal */}
        {showForm && selectedMainService && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {editingSubService ? 'Edit Sub-Service' : 'Add New Sub-Service'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  For: {selectedMainService.title}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Sub-Service Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub-Service Image *
                    </label>
                    <SingleImageUpload
                      currentImage={formData.image}
                      onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl || '' })}
                      required={true}
                    />
                  </div>

                  {/* Sub-Service Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub-Service Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Hardware Diagnostics"
                      required
                    />
                  </div>

                  {/* Sub-Service Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe this sub-service..."
                      required
                    />
                  </div>

                  {/* WhatsApp Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp Message *
                    </label>
                    <textarea
                      value={formData.whatsappMessage}
                      onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Message for this specific sub-service..."
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This message will be sent when customers click WhatsApp for this sub-service
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Sub-service is active and visible to customers
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingSubService ? 'Update Sub-Service' : 'Add Sub-Service'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubServices;
