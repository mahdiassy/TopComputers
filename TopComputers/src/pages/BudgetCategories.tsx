import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetCategories, type BudgetStatus, type BudgetCategory } from '../contexts/BudgetCategoryContext';
import { format } from 'date-fns';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiPlusCircle, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BudgetCategories = () => {
  const { 
    categories, 
    deleteCategory,
    getBudgetStats
  } = useBudgetCategories();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | ''>('');
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: BudgetStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  // Filter categories based on criteria
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      // Filter by status
      if (statusFilter && category.status !== statusFilter) return false;
      
      // Filter by search term
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchTerm) ||
          category.description.toLowerCase().includes(searchTerm) ||
          category.notes.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  }, [categories, statusFilter, search]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget category? This action cannot be undone.')) {
      try {
        await deleteCategory(id);
        toast.success('Budget category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete budget category');
      }
    }
  };
  
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const budgetStats = getBudgetStats();

  // Mobile Card Component
  const CategoryCard = ({ category }: { category: BudgetCategory }) => {
    const spentPercentage = category.monthlyBudget > 0 
      ? Math.min(Math.round((category.spent / category.monthlyBudget) * 100), 100) 
      : 0;
    
    const getProgressColor = () => {
      if (spentPercentage >= 90) return 'bg-red-500';
      if (spentPercentage >= 75) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    
    return (
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-primary text-lg truncate">{category.name}</h3>
            <div className="text-sm text-secondary mt-1">
              {category.description}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            <Link
              to={`/budget/edit/${category.id}`}
              className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              title="Edit Category"
            >
              <FiEdit2 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDelete(category.id)}
              className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Delete Category"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Monthly Budget</label>
            <div className="mt-1 font-medium text-primary">{formatCurrency(category.monthlyBudget)}</div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Spent</label>
            <div className="mt-1 font-medium text-primary">{formatCurrency(category.spent)}</div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Progress</label>
            <span className="text-xs text-secondary">{spentPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor()}`}
              style={{ width: `${spentPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(category.status)}`}>
                {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Created</label>
            <div className="mt-1 text-sm text-secondary">
              {category.createdAt && formatDate(category.createdAt.toDate())}
            </div>
          </div>
        </div>
        
        {category.notes && (
          <div>
            <label className="text-xs font-medium text-secondary uppercase tracking-wide">Notes</label>
            <div className="mt-1 text-sm text-secondary">{category.notes}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Budget Categories</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/budget/add" 
            className="btn-primary flex items-center justify-center"
          >
            <FiPlusCircle className="mr-2" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-blue-500">
          <div className="flex items-center">
            <FiDollarSign className="text-blue-500 w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400">Total Budget</h3>
              <p className="text-lg font-bold text-primary">{formatCurrency(budgetStats.totalBudget)}</p>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-green-500">
          <div className="flex items-center">
            <FiDollarSign className="text-green-500 w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400">Remaining Budget</h3>
              <p className="text-lg font-bold text-primary">{formatCurrency(budgetStats.remainingBudget)}</p>
            </div>
          </div>
        </div>
        
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center">
            <FiDollarSign className="text-red-500 w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400">Total Spent</h3>
              <p className="text-lg font-bold text-primary">{formatCurrency(budgetStats.totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BudgetStatus | '')}
              className="pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md transition-colors whitespace-nowrap cursor-pointer font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <FiUser className="mx-auto w-12 h-12 text-secondary mb-4" />
            <p className="text-secondary">No budget categories found</p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-3 px-4 font-medium text-secondary">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Monthly Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Spent</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Notes</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => {
                    const spentPercentage = category.monthlyBudget > 0 
                      ? Math.min(Math.round((category.spent / category.monthlyBudget) * 100), 100) 
                      : 0;
                    
                    const getProgressColor = () => {
                      if (spentPercentage >= 90) return 'bg-red-500';
                      if (spentPercentage >= 75) return 'bg-yellow-500';
                      return 'bg-green-500';
                    };
                    
                    return (
                      <tr key={category.id} className="border-b border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-primary">{category.name}</div>
                            <div className="text-sm text-secondary">{category.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-primary">{formatCurrency(category.monthlyBudget)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-primary">{formatCurrency(category.spent)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                            <div 
                              className={`h-2.5 rounded-full ${getProgressColor()}`}
                              style={{ width: `${spentPercentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-secondary">{spentPercentage}%</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(category.status)}`}>
                            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-secondary max-w-xs">
                            {category.notes ? (
                              <span className="line-clamp-2" title={category.notes}>
                                {category.notes}
                              </span>
                            ) : (
                              <span className="italic text-gray-400 dark:text-gray-500">No notes</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/budget/edit/${category.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <div className="text-sm text-secondary">
        Showing {filteredCategories.length} of {categories.length} budget categories
      </div>
    </div>
  );
};

export default BudgetCategories;
