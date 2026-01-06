import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBudgetCategories, type BudgetStatus } from '../contexts/BudgetCategoryContext';
import { FiSave, FiArrowLeft, FiFileText, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditBudgetCategory = () => {
  const { categories, updateCategory } = useBudgetCategories();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyBudget: '',
    status: 'active' as BudgetStatus,
    notes: '',
  });

  // Load category data when component mounts or categories change
  useEffect(() => {
    if (id && categories.length > 0) {
      const foundCategory = categories.find(c => c.id === id);
      if (foundCategory) {
        setCategory(foundCategory);
        setFormData({
          name: foundCategory.name,
          description: foundCategory.description || '',
          monthlyBudget: foundCategory.monthlyBudget.toString(),
          status: foundCategory.status,
          notes: foundCategory.notes || '',
        });
      } else {
        toast.error('Budget category not found');
        navigate('/budget');
      }
    }
  }, [id, categories, navigate]);

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
      toast.error('Category ID is missing');
      return;
    }
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
      toast.error('Monthly budget must be greater than 0');
      return;
    }

    setLoading(true);
    
    try {
      await updateCategory(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        monthlyBudget: parseFloat(formData.monthlyBudget),
        status: formData.status,
        notes: formData.notes.trim(),
      });
      
      toast.success('Budget category updated successfully');
      navigate('/budget');
    } catch (error) {
      toast.error('Failed to update budget category');
    } finally {
      setLoading(false);
    }
  };

  if (!category && categories.length > 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-secondary">Budget category not found</p>
          <button
            onClick={() => navigate('/budget')}
            className="mt-4 btn-primary"
          >
            Back to Budget Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/budget')}
          className="p-2 rounded-md text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Edit Budget Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiFileText className="mr-2 text-gray-600 dark:text-gray-300" />
              Category Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="Brief description of this category"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-gray-600 dark:text-gray-300" />
              Budget Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="monthlyBudget" className="block text-sm font-medium text-secondary mb-1">
                  Monthly Budget ($) *
                </label>
                <input
                  type="number"
                  id="monthlyBudget"
                  name="monthlyBudget"
                  value={formData.monthlyBudget}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-secondary mt-1">
                  Maximum amount allocated for this category each month
                </p>
              </div>
              
              {category && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Current Spending
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300">
                    ${category.spent.toFixed(2)}
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    Amount spent in this category so far
                  </p>
                </div>
              )}
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
              placeholder="Any additional information about this budget category..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/budget')}
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
                Updating Category...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Update Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBudgetCategory;
