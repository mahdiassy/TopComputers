import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions, type TransactionType } from '../contexts/TransactionContext';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { useBudgetCategories } from '../contexts/BudgetCategoryContext';
import toast from 'react-hot-toast';
import { FiSave, FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  const { getCategories } = useTransactionCategories();
  const { categories: budgetCategories } = useBudgetCategories();
  
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get suggested categories based on transaction type for personal finance
  const getSuggestedCategories = () => {
    return getCategories(type);
  };
  
  // Get active budget categories
  const getActiveBudgetCategories = () => {
    return budgetCategories.filter(cat => cat.status === 'active');
  };
  
  // Reset category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(''); // Reset category when type changes
    setBudgetCategoryId(''); // Reset budget category when type changes
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      const transactionData = {
        type,
        amount: parseFloat(amount),
        category: category.trim(),
        date: new Date(date + 'T00:00:00'),
        notes: notes.trim()
      };
      
      // Only add budgetCategoryId for expense transactions
      if (type === 'expense' && budgetCategoryId) {
        (transactionData as any).budgetCategoryId = budgetCategoryId;
      }
      
      console.log('Submitting transaction:', transactionData);
      
      await addTransaction(transactionData);
      
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} transaction added successfully`);
      navigate('/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(`Failed to add ${type} transaction`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-primary">Add Transaction</h1>
      
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
            <label htmlFor="amount" className="block text-sm font-medium text-secondary mb-2">
              Amount *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
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
            <label htmlFor="category" className="block text-sm font-medium text-secondary mb-2">
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
              <label htmlFor="budgetCategory" className="block text-sm font-medium text-secondary mb-2">
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
            <label htmlFor="date" className="block text-sm font-medium text-secondary mb-2">
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
            <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-1">
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
            <Link
              to="/transactions"
              className="btn-secondary flex items-center justify-center order-2 sm:order-1"
            >
              <FiX className="mr-2" /> Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center order-1 sm:order-2"
            >
              <FiSave className="mr-2" /> {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction; 