import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions, type TransactionType, type Transaction } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import { format, getYear } from 'date-fns';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiChevronRight, FiChevronDown, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Type for grouping options
type GroupLevel = 'year' | 'month' | 'day';

// Type for expanded groups tracking
type ExpandedGroups = Record<string, boolean>;

const Transactions = () => {
  const { transactions, deleteTransaction, getUsernameById } = useTransactions();
  const { currentUser, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [groupLevels, setGroupLevels] = useState<GroupLevel[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});
  
  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category)));
  }, [transactions]);
  
  // Get unique users for filter dropdown
  const users = useMemo(() => {
    const userIds = Array.from(new Set(transactions.map(t => t.createdBy)));
    return userIds.map(id => ({
      id,
      name: id === currentUser?.uid ? 'You' : (getUsernameById(id) || 'Unknown User')
    }));
  }, [transactions, currentUser, getUsernameById]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Filter transactions based on criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by type
      if (typeFilter && transaction.type !== typeFilter) return false;
      
      // Filter by category
      if (categoryFilter && transaction.category !== categoryFilter) return false;
      
      // Filter by start date
      if (dateFrom) {
        const startDate = new Date(dateFrom);
        if (transaction.date < startDate) return false;
      }
      
      // Filter by end date
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        if (transaction.date > endDate) return false;
      }
      
      // Filter by user
      if (userFilter) {
        if (userFilter === 'mine' && transaction.createdBy !== currentUser?.uid) return false;
        else if (userFilter !== 'mine' && transaction.createdBy !== userFilter) return false;
      }
      
      // Filter by search term
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          transaction.category.toLowerCase().includes(searchTerm) ||
          transaction.notes.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, dateFrom, dateTo, userFilter, search, currentUser]);
  
  // Toggle group expansion
  const toggleGroup = (groupPath: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupPath]: !prev[groupPath]
    }));
  };
  
  // Check if a group is expanded
  const isGroupExpanded = (groupPath: string) => {
    return !!expandedGroups[groupPath];
  };
  
  // Toggle group level selection
  const toggleGroupLevel = (level: GroupLevel) => {
    setGroupLevels(prev => {
      if (prev.includes(level)) {
        // Remove this level and all levels that come after it
        const levelIndex = prev.indexOf(level);
        return prev.slice(0, levelIndex);
      } else {
        // Determine the proper order
        const orderedLevels: GroupLevel[] = [];
        
        if (prev.includes('year') || level === 'year') {
          orderedLevels.push('year');
        }
        
        if ((orderedLevels.includes('year') && prev.includes('month')) || level === 'month') {
          orderedLevels.push('month');
        }
        
        if ((orderedLevels.includes('month') && prev.includes('day')) || level === 'day') {
          orderedLevels.push('day');
        }
        
        return orderedLevels;
      }
    });
    
    // Reset expanded groups when changing grouping levels
    setExpandedGroups({});
  };
  
  // Function to get group key for a transaction at a specific level
  const getGroupKey = (transaction: Transaction, level: GroupLevel): string => {
    const date = transaction.date;
    
    switch (level) {
      case 'year':
        return getYear(date).toString();
      case 'month':
        return format(date, 'MMMM');
      case 'day':
        return format(date, 'd');
      default:
        return '';
    }
  };
  
  // Get full path for a group (for unique identification)
  const getGroupPath = (groupKeys: string[]): string => {
    return groupKeys.join('/');
  };
  
  // Recursive function to build hierarchical groups
  const buildHierarchicalGroups = (
    transactions: Transaction[], 
    levels: GroupLevel[], 
    currentLevelIndex: number = 0,
    parentGroupKeys: string[] = []
  ): any => {
    // If we've processed all levels or there are no more levels, return transactions
    if (currentLevelIndex >= levels.length) {
      return transactions;
    }
    
    const currentLevel = levels[currentLevelIndex];
    const groups: Record<string, any> = {};
    
    // Group transactions by the current level
    transactions.forEach(transaction => {
      const groupKey = getGroupKey(transaction, currentLevel);
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(transaction);
    });
    
    // For each group at this level, process the next level
    const result: Record<string, any> = {};
    
    Object.entries(groups).forEach(([groupKey, groupTransactions]) => {
      const currentGroupKeys = [...parentGroupKeys, groupKey];
      
      // If there are more levels, process them recursively
      if (currentLevelIndex < levels.length - 1) {
        result[groupKey] = {
          transactions: groupTransactions,
          children: buildHierarchicalGroups(
            groupTransactions, 
            levels, 
            currentLevelIndex + 1,
            currentGroupKeys
          )
        };
      } else {
        // Otherwise, just store the transactions
        result[groupKey] = {
          transactions: groupTransactions,
          children: {}
        };
      }
    });
    
    return result;
  };
  
  // Group transactions hierarchically
  const hierarchicalGroups = useMemo(() => {
    if (groupLevels.length === 0) {
      return { transactions: filteredTransactions };
    }
    
    return buildHierarchicalGroups(filteredTransactions, groupLevels);
  }, [filteredTransactions, groupLevels]);
  
  // Calculate group totals
  const calculateGroupTotals = (transactions: Transaction[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, net: income - expense };
  };
  
  // Handle transaction deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        toast.success('Transaction deleted successfully');
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setTypeFilter('');
    setCategoryFilter('');
    setDateFrom('');
    setDateTo('');
    setUserFilter('');
    setSearch('');
    setGroupLevels([]);
    setExpandedGroups({});
  };
  
  // Check if the current user can edit/delete a transaction
  const canModifyTransaction = (createdBy: string) => {
    return createdBy === currentUser?.uid || isAdmin();
  };
  
  // Get display name for a transaction creator
  const getTransactionCreator = (createdBy: string) => {
    if (createdBy === currentUser?.uid) return 'You';
    return getUsernameById(createdBy) || 'Unknown User';
  };
  
  // Format label for group level
  const formatGroupLabel = (level: GroupLevel, value: string): string => {
    switch (level) {
      case 'year':
        return `Year ${value}`;
      case 'month':
        return `${value}`;
      case 'day':
        return `Day ${value}`;
      default:
        return value;
    }
  };
  
  // Render transactions table
  const renderTransactionsTable = (transactions: Transaction[]) => {
    return (
      <div className="mt-2">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="space-y-3 p-4">
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <div key={transaction.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                        <span className="text-xs text-secondary">
                          {format(transaction.date, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h4 className="font-medium text-primary">{transaction.category}</h4>
                      <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    {canModifyTransaction(transaction.createdBy) && (
                      <div className="flex gap-2 ml-2">
                        <Link 
                          to={`/transactions/edit/${transaction.id}`} 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded transition-colors duration-200 flex items-center justify-center"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded transition-colors duration-200 flex items-center justify-center cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {transaction.notes && (
                    <p className="text-sm text-secondary mb-2">{transaction.notes}</p>
                  )}
                  <div className="flex items-center text-xs text-secondary">
                    <FiUser className="mr-1" />
                    {getTransactionCreator(transaction.createdBy)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary">
                No transactions found
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length > 0 ? (
                transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {format(transaction.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate">
                      {transaction.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      <span className="inline-flex items-center">
                        <FiUser className="mr-1" />
                        {getTransactionCreator(transaction.createdBy)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {canModifyTransaction(transaction.createdBy) ? (
                        <div className="flex justify-center items-center space-x-2">
                          <Link 
                            to={`/transactions/edit/${transaction.id}`} 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded transition-colors duration-200 flex items-center justify-center"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded transition-colors duration-200 flex items-center justify-center cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-secondary italic text-xs">
                          No access
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-secondary">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Recursive function to render hierarchical groups
  const renderGroups = (
    groups: Record<string, any>, 
    level: number = 0, 
    parentPath: string[] = [], 
    levelLabels: GroupLevel[] = groupLevels
  ) => {
    return Object.entries(groups).map(([groupKey, group]) => {
      const currentPath = [...parentPath, groupKey];
      const groupPath = getGroupPath(currentPath);
      const isExpanded = isGroupExpanded(groupPath);
      const totals = calculateGroupTotals(group.transactions);
      
      // Define background colors for different levels
      const getBgColor = () => {
        switch(level) {
          case 0: return 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40';
          case 1: return 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40';
          case 2: return 'bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40';
          default: return 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/60';
        }
      };
      
      // Define text color for different levels
      const getTextColor = () => {
        switch(level) {
          case 0: return 'text-blue-800 dark:text-blue-300';
          case 1: return 'text-green-800 dark:text-green-300';
          case 2: return 'text-amber-800 dark:text-amber-300';
          default: return 'text-gray-800 dark:text-gray-300';
        }
      };
      
      return (
        <div key={groupPath} className="mt-2">
          <div 
            className={`flex flex-col lg:flex-row lg:justify-between lg:items-center p-3 ${getBgColor()} border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer ${isExpanded ? 'rounded-b-none shadow-sm' : 'shadow-sm'} transition-all duration-200 hover:shadow-md active:scale-[0.99]`}
            onClick={() => toggleGroup(groupPath)}
          >
            <div className="flex items-center mb-2 lg:mb-0">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 transition-all duration-200 ${isExpanded ? 'bg-white dark:bg-gray-700 shadow-sm' : `${getTextColor()} bg-opacity-10 dark:bg-opacity-20 hover:bg-opacity-20 dark:hover:bg-opacity-30`}`}>
                {isExpanded ? <FiChevronDown className={`${getTextColor()} transition-transform duration-200`} /> : <FiChevronRight className={`${getTextColor()} transition-transform duration-200`} />}
              </div>
              <span className={`font-medium ${getTextColor()}`}>{formatGroupLabel(levelLabels[level], groupKey)}</span>
              <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">{group.transactions.length} transaction(s)</span>
            </div>
            <div className="text-sm">
              <div className="flex flex-wrap gap-2 lg:gap-4">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Income: {formatCurrency(totals.income)}
                </span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Expense: {formatCurrency(totals.expense)}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Net: {formatCurrency(totals.net)}
                </span>
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div className={`pl-4 border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-lg ${level === 0 ? 'bg-blue-50/30 dark:bg-blue-900/20' : level === 1 ? 'bg-green-50/30 dark:bg-green-900/20' : level === 2 ? 'bg-amber-50/30 dark:bg-amber-900/20' : 'bg-white dark:bg-gray-800/30'}`}>
              {/* If there are children (subgroups), render them */}
              {Object.keys(group.children).length > 0 ? (
                <div className="py-2">
                  {renderGroups(group.children, level + 1, currentPath, levelLabels)}
                </div>
              ) : (
                /* Otherwise, render the transactions */
                renderTransactionsTable(group.transactions)
              )}
            </div>
          )}
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Transactions</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/transactions/add" 
            className="btn-primary flex items-center justify-center"
          >
            <FiPlusCircle className="mr-2" />
            Add Transaction
          </Link>
        </div>
      </div>
      
      {/* Filters, Group By, and Search - Optimized Layout */}
      <div className="card">
        {/* Filters Section with Created By */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-3">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-secondary mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-secondary mb-1">
                Type
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label htmlFor="user-filter" className="block text-sm font-medium text-secondary mb-1">
                Created By
              </label>
              <select
                id="user-filter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Users</option>
                <option value="mine">My Transactions</option>
                {users.filter(user => user.id !== currentUser?.uid).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-secondary mb-1">
                From Date
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-secondary mb-1">
                To Date
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Search and Group By Section */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Search</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-secondary" />
                </div>
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search categories or notes..."
                />
              </div>
            </div>

            {/* Group By */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Group By</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => toggleGroupLevel('year')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    groupLevels.includes('year')
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Year
                </button>
                <button
                  onClick={() => toggleGroupLevel('month')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    groupLevels.includes('month')
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  disabled={!groupLevels.includes('year')}
                >
                  Month
                </button>
                <button
                  onClick={() => toggleGroupLevel('day')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                    groupLevels.includes('day')
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  } ${!groupLevels.includes('month') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!groupLevels.includes('month')}
                >
                  Day
                </button>
                {groupLevels.length > 0 && (
                  <button
                    onClick={() => setGroupLevels([])}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-secondary">
                Enable Year → Month → Day for hierarchical grouping.
              </p>
            </div>
          </div>
        </div>

        {/* Clear All Filters */}
        {(search || userFilter || categoryFilter || typeFilter || dateFrom || dateTo || groupLevels.length > 0) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors font-medium cursor-pointer"
            >
              Clear All Filters & Grouping
            </button>
          </div>
        )}
      </div>
      
      {/* Transactions Groups */}
      <div className="space-y-3">
        {groupLevels.length > 0 ? (
          renderGroups(hierarchicalGroups)
        ) : (
          <div className="card">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
                <h3 className="text-lg font-medium text-primary">
                  All Transactions
                </h3>
                <div className="text-sm">
                  {(() => {
                    const totals = calculateGroupTotals(filteredTransactions);
                    return (
                      <div className="flex flex-wrap gap-2 lg:gap-4">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Income: {formatCurrency(totals.income)}
                        </span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Expense: {formatCurrency(totals.expense)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          Net: {formatCurrency(totals.net)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            {renderTransactionsTable(filteredTransactions)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 