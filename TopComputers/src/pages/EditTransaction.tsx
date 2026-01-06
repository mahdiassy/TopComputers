import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactions, type TransactionType } from '../contexts/TransactionContext';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { useBudgetCategories } from '../contexts/BudgetCategoryContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiSave, FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { format } from 'date-fns';

const EditTransaction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, updateTransaction } = useTransactions();
  const { getCategories } = useTransactionCategories();
  const { categories: budgetCategories } = useBudgetCategories();
  const { currentUser, isAdmin } = useAuth();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  
  // Get suggested categories based on transaction type
  const getSuggestedCategories = () => {
    return getCategories(type);
  };
  
  // Get active budget categories
  const getActiveBudgetCategories = () => {
    return budgetCategories.filter(cat => cat.status === 'active');
  };
  
  // Handle type change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    
    // If changing from expense to income, clear budget category
    if (newType === 'income') {
      setBudgetCategoryId('');
    }
  };
  
  useEffect(() => {
    if (!currentUser) {
      toast.error('You must be logged in to edit transactions');
      navigate('/login');
      return;
    }

    if (!id) {
      setNotFound(true);
      return;
    }

    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) {
      setNotFound(true);
      return;
    }
    
    // Check if the current user owns this transaction OR is an admin
    if (transaction.createdBy !== currentUser?.uid && !isAdmin()) {
      setNotAuthorized(true);
      toast.error("You don't have permission to edit this transaction");
      navigate('/transactions');
      return;
    }
    
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setBudgetCategoryId(transaction.budgetCategoryId || '');
    setDate(format(transaction.date, 'yyyy-MM-dd'));
    setNotes(transaction.notes);
  }, [id, transactions, currentUser, navigate, isAdmin]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    if (!amount || !category || !date) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    
    try {
      setLoading(true);
      
      await updateTransaction(id, {
        type,
        amount: parseFloat(amount),
        category,
        budgetCategoryId: type === 'expense' ? budgetCategoryId : undefined,
        date: new Date(date),
        notes
      });
      
      toast.success('Transaction updated successfully');
      navigate('/transactions');
    } catch (error) {
      toast.error('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };
  
  if (notFound) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-primary mb-4">Transaction Not Found</h1>
        <p className="text-secondary mb-6">The transaction you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/transactions')}
          className="btn-primary"
        >
          Back to Transactions
        </button>
      </div>
    );
  }
  
  if (notAuthorized) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-primary mb-4">Not Authorized</h1>
        <p className="text-secondary mb-6">You don't have permission to edit this transaction.</p>
        <button
          onClick={() => navigate('/transactions')}
          className="btn-primary"
        >
          Back to Transactions
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-primary">Edit Transaction</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Income Button */}
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer
                  ${type === 'income' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                  }
                `}
              >
                <FiTrendingUp className={`w-6 h-6 ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
                <span className="font-medium">Income</span>
                {type === 'income' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </button>

              {/* Expense Button */}
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer
                  ${type === 'expense' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                  }
                `}
              >
                <FiTrendingDown className={`w-6 h-6 ${type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`} />
                <span className="font-medium">Expense</span>
                {type === 'expense' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-primary mb-1">
              Amount *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-7"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-primary mb-1">
              Category *
            </label>
            {type === 'income' ? (
              // Dropdown for income categories
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a category</option>
                {getSuggestedCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            ) : (
              // Free text input for expense categories
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                placeholder="Enter a category"
                list="category-suggestions"
                required
              />
            )}
            {type === 'expense' && (
              <datalist id="category-suggestions">
                {getSuggestedCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </datalist>
            )}
          </div>
          
          {/* Budget Category (only for expenses) */}
          {type === 'expense' && (
            <div>
              <label htmlFor="budgetCategory" className="block text-sm font-medium text-primary mb-1">
                Budget Category
              </label>
              <select
                id="budgetCategory"
                value={budgetCategoryId}
                onChange={(e) => setBudgetCategoryId(e.target.value)}
                className="input-field"
              >
                <option value="">None (Don't track in budget)</option>
                {getActiveBudgetCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cat.monthlyBudget)} budget</option>
                ))}
              </select>
              <p className="text-xs text-secondary mt-1">
                Select a budget category to track this expense against your budget
              </p>
            </div>
          )}
          
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-primary mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Add any additional notes here..."
            />
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary flex items-center justify-center order-2 sm:order-1"
            >
              <FiX className="mr-2" /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center order-1 sm:order-2"
            >
              <FiSave className="mr-2" /> {loading ? 'Updating...' : 'Update Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransaction; 