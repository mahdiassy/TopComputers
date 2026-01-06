import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClients, type ProjectStatus, type PaymentStatus } from '../contexts/ClientContext';
import { format } from 'date-fns';
import { FiSave, FiArrowLeft, FiUser, FiMail, FiPhone, FiFileText, FiDollarSign, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditClient = () => {
  const { clients, updateClient } = useClients();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectName: '',
    projectType: '',
    projectPayment: '',
    annualFee: '',
    startDate: '',
    contractEndDate: '',
    projectStatus: 'active' as ProjectStatus,
    paymentStatus: 'pending' as PaymentStatus,
    notes: '',
  });

  const projectTypes = [
    'Web Development',
    'Mobile App Development',
    'E-commerce Platform',
    'Custom Software',
    'API Development',
    'Database Design',
    'UI/UX Design',
    'Consulting',
    'Maintenance',
    'Other'
  ];

  // Load client data when component mounts or clients change
  useEffect(() => {
    if (id && clients.length > 0) {
      const foundClient = clients.find(c => c.id === id);
      if (foundClient) {
        setClient(foundClient);
        setFormData({
          name: foundClient.name,
          email: foundClient.email,
          phone: foundClient.phone || '',
          projectName: foundClient.projectName,
          projectType: foundClient.projectType,
          projectPayment: foundClient.projectPayment.toString(),
          annualFee: foundClient.annualFee.toString(),
          startDate: format(foundClient.startDate, 'yyyy-MM-dd'),
          contractEndDate: format(foundClient.contractEndDate, 'yyyy-MM-dd'),
          projectStatus: foundClient.projectStatus,
          paymentStatus: foundClient.paymentStatus,
          notes: foundClient.notes || '',
        });
      } else {
        toast.error('Client not found');
        navigate('/clients');
      }
    }
  }, [id, clients, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('Client ID not found');
      return;
    }
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Client name is required');
      return;
    }
    

    
    if (!formData.projectName.trim()) {
      toast.error('Project name is required');
      return;
    }
    
    if (!formData.projectPayment || parseFloat(formData.projectPayment) <= 0) {
      toast.error('Project payment must be greater than 0');
      return;
    }
    
    if (!formData.annualFee || parseFloat(formData.annualFee) <= 0) {
      toast.error('Annual fee must be greater than 0');
      return;
    }

    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setLoading(true);
    
    try {
      await updateClient(id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        projectName: formData.projectName.trim(),
        projectType: formData.projectType || 'Other',
        projectPayment: parseFloat(formData.projectPayment),
        annualFee: parseFloat(formData.annualFee),
        startDate: new Date(formData.startDate),
        contractEndDate: new Date(formData.contractEndDate),
        projectStatus: formData.projectStatus,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes.trim(),
      });
      
      toast.success('Client updated successfully');
      navigate('/clients');
    } catch (error) {
      toast.error('Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-md text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Edit Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiUser className="mr-2 text-gray-600 dark:text-gray-300" />
              Client Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="Enter client name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiFileText className="mr-2 text-gray-600 dark:text-gray-300" />
              Project Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-secondary mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-secondary mb-1">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                >
                  <option value="">Select project type</option>
                  {projectTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectStatus" className="block text-sm font-medium text-secondary mb-1">
                    Project Status
                  </label>
                  <select
                    id="projectStatus"
                    name="projectStatus"
                    value={formData.projectStatus}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-secondary mb-1">
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-gray-600 dark:text-gray-300" />
              Financial Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="projectPayment" className="block text-sm font-medium text-secondary mb-1">
                  Project Payment ($) *
                </label>
                <input
                  type="number"
                  id="projectPayment"
                  name="projectPayment"
                  value={formData.projectPayment}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-secondary mt-1">
                  One-time payment for the project
                </p>
              </div>
              
              <div>
                <label htmlFor="annualFee" className="block text-sm font-medium text-secondary mb-1">
                  Annual Fee ($) *
                </label>
                <input
                  type="number"
                  id="annualFee"
                  name="annualFee"
                  value={formData.annualFee}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-secondary mt-1">
                  Yearly renewal fee for maintenance/support
                </p>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiCalendar className="mr-2 text-gray-600 dark:text-gray-300" />
              Timeline
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-secondary mb-1">
                  Project Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full date-input-dark"
                  required
                />
                <p className="text-xs text-secondary mt-1">
                  When the project started (determines renewal date)
                </p>
              </div>
              
              <div>
                <label htmlFor="contractEndDate" className="block text-sm font-medium text-secondary mb-1">
                  Contract End Date
                </label>
                <input
                  type="date"
                  id="contractEndDate"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full date-input-dark"
                />
                <p className="text-xs text-secondary mt-1">
                  Optional: When the contract officially ends
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Additional Notes
          </h2>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full resize-none"
              placeholder="Any additional information about the client or project..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="btn-secondary flex items-center justify-center"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Client...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Update Client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClient; 