import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageCircle, 
  ChevronDown, 
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { useServices } from '../contexts/ServicesContext';
import { useActivity } from '../contexts/ActivityContext';
import type { MainService, SubService, ServiceFormData, SubServiceFormData } from '../types/services';
import MediaSelector from '../components/MediaSelector';

const AdminServicesUnified: React.FC = () => {
  const { 
    mainServices, 
    subServices, 
    addMainService, 
    updateMainService, 
    deleteMainService,
    addSubService,
    updateSubService,
    deleteSubService,
    generateWhatsAppUrl
  } = useServices();
  const { addActivity } = useActivity();

  // State for main services
  const [showMainServiceForm, setShowMainServiceForm] = useState(false);
  const [editingMainService, setEditingMainService] = useState<MainService | null>(null);
  const [mainServiceFormData, setMainServiceFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    image: '',
    whatsappMessage: '',
    isActive: true,
  });

  // State for sub-services
  const [showSubServiceForm, setShowSubServiceForm] = useState(false);
  const [editingSubService, setEditingSubService] = useState<SubService | null>(null);
  const [selectedMainServiceForSub, setSelectedMainServiceForSub] = useState<MainService | null>(null);
  const [subServiceFormData, setSubServiceFormData] = useState<SubServiceFormData>({
    mainServiceId: '',
    title: '',
    description: '',
    image: '',
    whatsappMessage: '',
    isActive: true,
  });

  // State for expandable rows
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  // Main Service Handlers
  const handleMainServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMainService) {
        await updateMainService(editingMainService.id, mainServiceFormData);
        addActivity({
          type: 'service',
          action: 'updated',
          title: mainServiceFormData.title,
          description: `Updated service: ${mainServiceFormData.title}`
        });
      } else {
        await addMainService(mainServiceFormData);
        addActivity({
          type: 'service',
          action: 'created',
          title: mainServiceFormData.title,
          description: `Created new service: ${mainServiceFormData.title}`
        });
      }
      resetMainServiceForm();
    } catch (error) {
      console.error('Error saving main service:', error);
    }
  };

  const resetMainServiceForm = () => {
    setMainServiceFormData({
      title: '',
      description: '',
      image: '',
      whatsappMessage: '',
      isActive: true,
    });
    setEditingMainService(null);
    setShowMainServiceForm(false);
  };

  const handleEditMainService = (service: MainService) => {
    setMainServiceFormData({
      title: service.title,
      description: service.description,
      image: service.image,
      whatsappMessage: service.whatsappMessage,
      isActive: service.isActive,
    });
    setEditingMainService(service);
    setShowMainServiceForm(true);
  };

  const handleDeleteMainService = async (id: string) => {
    const service = mainServices.find(s => s.id === id);
    if (window.confirm('Are you sure you want to delete this service and all its sub-services?')) {
      try {
        await deleteMainService(id);
        if (service) {
          addActivity({
            type: 'service',
            action: 'deleted',
            title: service.title,
            description: `Deleted service: ${service.title}`
          });
        }
        setExpandedServices(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        console.error('Error deleting main service:', error);
      }
    }
  };

  // Sub Service Handlers
  const handleSubServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubService) {
        await updateSubService(editingSubService.id, subServiceFormData);
        addActivity({
          type: 'subservice',
          action: 'updated',
          title: subServiceFormData.title,
          description: `Updated sub-service: ${subServiceFormData.title}`
        });
      } else {
        await addSubService(subServiceFormData);
        addActivity({
          type: 'subservice',
          action: 'created',
          title: subServiceFormData.title,
          description: `Created new sub-service: ${subServiceFormData.title}`
        });
      }
      resetSubServiceForm();
    } catch (error) {
      console.error('Error saving sub-service:', error);
    }
  };

  const resetSubServiceForm = () => {
    setSubServiceFormData({
      mainServiceId: '',
      title: '',
      description: '',
      image: '',
      whatsappMessage: '',
      isActive: true,
    });
    setEditingSubService(null);
    setShowSubServiceForm(false);
    setSelectedMainServiceForSub(null);
  };

  const handleEditSubService = (subService: SubService) => {
    setSubServiceFormData({
      mainServiceId: subService.mainServiceId,
      title: subService.title,
      description: subService.description,
      image: subService.image,
      whatsappMessage: subService.whatsappMessage,
      isActive: subService.isActive,
    });
    setEditingSubService(subService);
    setShowSubServiceForm(true);
  };

  const handleDeleteSubService = async (id: string) => {
    const subService = subServices.find(s => s.id === id);
    if (window.confirm('Are you sure you want to delete this sub-service?')) {
      try {
        await deleteSubService(id);
        if (subService) {
          addActivity({
            type: 'subservice',
            action: 'deleted',
            title: subService.title,
            description: `Deleted sub-service: ${subService.title}`
          });
        }
      } catch (error) {
        console.error('Error deleting sub-service:', error);
      }
    }
  };

  const handleAddSubService = (mainService: MainService) => {
    setSelectedMainServiceForSub(mainService);
    setSubServiceFormData({
      mainServiceId: mainService.id,
      title: '',
      description: '',
      image: '',
      whatsappMessage: '',
      isActive: true,
    });
    setShowSubServiceForm(true);
  };

  // Expandable rows handlers
  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage main services and their sub-services in one place
          </p>
        </div>
        <button
          onClick={() => setShowMainServiceForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Main Service</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sub-Services
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mainServices.map((service) => (
                <React.Fragment key={service.id}>
                  {/* Main Service Row */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleServiceExpansion(service.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {expandedServices.has(service.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <div className="flex items-center space-x-3">
                          {service.image && (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {service.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {service.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {service.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {service.subServices.length}
                        </span>
                        <button
                          onClick={() => handleAddSubService(service)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          + Add
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMainService(service)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                          title="Edit Service"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <a
                          href={generateWhatsAppUrl(service.whatsappMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                          title="WhatsApp Preview"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteMainService(service.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Sub-Services Rows */}
                  <AnimatePresence>
                    {expandedServices.has(service.id) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 dark:bg-gray-700"
                      >
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Sub-Services ({service.subServices.length})
                              </h4>
                              <button
                                onClick={() => handleAddSubService(service)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                <Plus className="h-3 w-3 inline mr-1" />
                                Add Sub-Service
                              </button>
                            </div>
                            
                            {service.subServices.length === 0 ? (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No sub-services yet</p>
                                <p className="text-xs">Click "Add Sub-Service" to get started</p>
                              </div>
                            ) : (
                              <div className="grid gap-3">
                                {service.subServices.map((subService) => (
                                  <div
                                    key={subService.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        {subService.image && (
                                          <img
                                            src={subService.image}
                                            alt={subService.title}
                                            className="h-10 w-10 rounded-lg object-cover"
                                          />
                                        )}
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {subService.title}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md truncate">
                                            {subService.description}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          subService.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                          {subService.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                          onClick={() => handleEditSubService(subService)}
                                          className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                                          title="Edit Sub-Service"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                        <a
                                          href={generateWhatsAppUrl(subService.whatsappMessage)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                                          title="WhatsApp Preview"
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                        </a>
                                        <button
                                          onClick={() => handleDeleteSubService(subService.id)}
                                          className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                                          title="Delete Sub-Service"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Service Form Modal */}
      <AnimatePresence>
        {showMainServiceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingMainService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={resetMainServiceForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleMainServiceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      value={mainServiceFormData.title}
                      onChange={(e) => setMainServiceFormData({ ...mainServiceFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={mainServiceFormData.description}
                      onChange={(e) => setMainServiceFormData({ ...mainServiceFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <MediaSelector
                      label="Service Image"
                      currentImage={mainServiceFormData.image}
                      onSelect={(image) => setMainServiceFormData({ ...mainServiceFormData, image })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp Message *
                    </label>
                    <textarea
                      value={mainServiceFormData.whatsappMessage}
                      onChange={(e) => setMainServiceFormData({ ...mainServiceFormData, whatsappMessage: e.target.value })}
                      rows={2}
                      placeholder="Message that will be sent when user clicks WhatsApp button..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={mainServiceFormData.isActive}
                      onChange={(e) => setMainServiceFormData({ ...mainServiceFormData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active Service
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetMainServiceForm}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingMainService ? 'Update Service' : 'Create Service'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Service Form Modal */}
      <AnimatePresence>
        {showSubServiceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingSubService ? 'Edit Sub-Service' : 'Add New Sub-Service'}
                  </h2>
                  <button
                    onClick={resetSubServiceForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedMainServiceForSub && (
                  <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Adding sub-service to: <strong>{selectedMainServiceForSub.title}</strong>
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubServiceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sub-Service Title *
                    </label>
                    <input
                      type="text"
                      value={subServiceFormData.title}
                      onChange={(e) => setSubServiceFormData({ ...subServiceFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={subServiceFormData.description}
                      onChange={(e) => setSubServiceFormData({ ...subServiceFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <MediaSelector
                      label="Sub-Service Image"
                      currentImage={subServiceFormData.image}
                      onSelect={(image) => setSubServiceFormData({ ...subServiceFormData, image })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp Message *
                    </label>
                    <textarea
                      value={subServiceFormData.whatsappMessage}
                      onChange={(e) => setSubServiceFormData({ ...subServiceFormData, whatsappMessage: e.target.value })}
                      rows={2}
                      placeholder="Message that will be sent when user clicks WhatsApp button..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="subIsActive"
                      checked={subServiceFormData.isActive}
                      onChange={(e) => setSubServiceFormData({ ...subServiceFormData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="subIsActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active Sub-Service
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetSubServiceForm}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingSubService ? 'Update Sub-Service' : 'Create Sub-Service'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServicesUnified;
