import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { useBudgetCategories } from '../contexts/BudgetCategoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiList, FiPlusCircle, FiUsers, FiAlertTriangle, FiCalendar } from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Unified activity log type for display
type UnifiedActivity = {
  id: string;
  action: 'added' | 'edited' | 'deleted' | 'renewed';
  userId: string;
  username: string;
  timestamp: Date;
  type: 'transaction' | 'client' | 'budget';
  details: {
    transactionDetails?: {
      amount?: number;
      type?: string;
      category?: string;
    };
    clientDetails?: {
      name?: string;
      projectName?: string;
      renewalDate?: Date;
    };
    categoryDetails?: {
      name?: string;
      monthlyBudget?: number;
    };
  };
};

const Dashboard = () => {
  const { transactions, activityLogs, getUsernameById } = useTransactions();
  const { getBudgetStats, budgetActivityLogs, categories } = useBudgetCategories();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  
  // Calculate summary data for all transactions
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;
  
  // Get budget statistics
  const budgetStats = getBudgetStats();
  
  // Get monthly totals for chart
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => 
        isWithinInterval(t.date, { start: monthStart, end: monthEnd })
      );
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      months.push({
        month: format(date, 'MMM'),
        income,
        expense,
        net: income - expense
      });
    }
    
    return months;
  }, [transactions]);
  
  // Prepare data for category breakdown
  const expenseData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const { category, amount } = transaction;
        
        if (!categories[category]) {
          categories[category] = 0;
        }
        
        categories[category] += amount;
      });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);
  
  // Combine and filter recent activity logs from both transactions and budget categories
  const recentActivity = useMemo((): UnifiedActivity[] => {
    const transactionActivities: UnifiedActivity[] = activityLogs.map(activity => ({
      id: activity.id,
      action: activity.action,
      userId: activity.userId,
      username: activity.username,
      timestamp: activity.timestamp,
      type: 'transaction',
      details: {
        transactionDetails: activity.transactionDetails
      }
    }));

    const budgetActivities: UnifiedActivity[] = budgetActivityLogs.map(activity => ({
      id: `budget-${activity.id}`,
      action: activity.action,
      userId: activity.userId,
      username: activity.username,
      timestamp: activity.timestamp,
      type: 'budget',
      details: {
        categoryDetails: activity.categoryDetails
      }
    }));

    // Combine and sort by timestamp (most recent first)
    const allActivities = [...transactionActivities, ...budgetActivities];
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return allActivities.slice(0, 5);
  }, [activityLogs, budgetActivityLogs]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get username display for an activity log
  const getUsernameDisplay = (activity: UnifiedActivity) => {
    if (activity.userId === currentUser?.uid) {
      return 'You';
    }
    
    // Try to use the username from the activity log first (for newer logs)
    if (activity.username) {
      return activity.username;
    }
    
    // Fall back to the cached username or "User" if not found
    return getUsernameById(activity.userId) || 'User';
  };

  // Format activity description
  const getActivityDescription = (activity: UnifiedActivity) => {
    if (activity.type === 'transaction' && activity.details.transactionDetails) {
      const { amount, type, category } = activity.details.transactionDetails;
      return (
        <>
          {activity.action} a {type}{' '}
          {amount && (
            <span className="block sm:inline">
              of {formatCurrency(amount)}{' '}
            </span>
          )}
          {category && (
            <span className="block sm:inline">
              in {category}
            </span>
          )}
        </>
      );
    } else if (activity.type === 'budget' && activity.details.categoryDetails) {
      const { name, monthlyBudget } = activity.details.categoryDetails;
      return (
        <>
          {activity.action} budget category {name}
          {monthlyBudget && (
            <span className="block sm:inline">
              {' '}(Budget: {formatCurrency(monthlyBudget as number)})
            </span>
          )}
        </>
      );
    }
    return `${activity.action} ${activity.type}`;
  };
  
  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-primary">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            to="/budget/add" 
            className="btn-secondary flex items-center justify-center"
          >
            <FiUsers className="mr-2" />
            Add Budget Category
          </Link>
          <Link 
            to="/transactions/add" 
            className="btn-primary flex items-center justify-center"
          >
            <FiPlusCircle className="mr-2" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Budget Alerts */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertTriangle className="text-blue-500 w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">Monthly Budget</h3>
                  <p className="text-sm text-secondary">
                    {formatCurrency(budgetStats.totalBudget)} budgeted for this month
                  </p>
                </div>
              </div>
              <Link 
                to="/budget" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View Categories
              </Link>
            </div>
          </div>
          
          <div className="card border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiCalendar className="text-green-500 w-6 h-6 mr-3" />
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400">Budget Remaining</h3>
                  <p className="text-sm text-secondary">
                    {formatCurrency(budgetStats.remainingBudget)} remaining of {formatCurrency(budgetStats.totalBudget)}
                  </p>
                </div>
              </div>
              <Link 
                to="/budget" 
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <FiTrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${netBalance >= 0 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <FiDollarSign className={`w-6 h-6 ${netBalance >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">Net Balance</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-red-600 dark:text-red-400'
              }`}>
                ${netBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">Budget Categories</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{budgetStats.categoryCount}</p>
              <p className="text-xs text-secondary">{formatCurrency(budgetStats.totalBudget)}/month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Trends</h3>
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: theme === 'dark' ? '#ffffff' : '#000000' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12, fill: theme === 'dark' ? '#ffffff' : '#000000' }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ fontSize: '14px' }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="income" fill="#4CAF50" name="Income" />
                <Bar dataKey="expense" fill="#F44336" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-primary mb-4">Category Breakdown</h3>
          {expenseData.length > 0 ? (
            <div className="w-full h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    fill="#8884d8"
                    label={({ name, percent }) => {
                      return percent > 5 ? `${name}: ${percent.toFixed(1)}%` : '';
                    }}
                    labelLine={false}
                    fontSize={12}
                  >
                    {expenseData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '6px',
                      color: 'var(--tooltip-text)'
                    }}
                    labelStyle={{
                      color: 'var(--tooltip-text)'
                    }}
                    itemStyle={{
                      color: 'var(--tooltip-text)'
                    }}
                    formatter={(value, name) => [
                      `$${Number(value).toFixed(2)}`,
                      name
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(value) => {
                      return value.length > 25 ? value.substring(0, 25) + '...' : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 lg:h-80 flex items-center justify-center text-secondary">
              <div className="text-center">
                <FiPieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expenses to display</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center">
                  <div className={`
                    p-2 rounded-full flex items-center justify-center mr-3
                    ${activity.action === 'added' ? 'bg-green-100 dark:bg-green-900/30' : 
                      activity.action === 'edited' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                      activity.action === 'renewed' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-red-100 dark:bg-red-900/30'}
                  `}>
                    <span className={`
                      text-xs font-bold
                      ${activity.action === 'added' ? 'text-green-600 dark:text-green-400' : 
                        activity.action === 'edited' ? 'text-blue-600 dark:text-blue-400' : 
                        activity.action === 'renewed' ? 'text-purple-600 dark:text-purple-400' :
                        'text-red-600 dark:text-red-400'}
                    `}>
                      {activity.action === 'added' ? '+' : 
                       activity.action === 'edited' ? 'E' : 
                       activity.action === 'renewed' ? 'R' : 
                       '-'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm lg:text-base truncate">
                      <span className="font-medium">
                        {getUsernameDisplay(activity)}
                      </span>{' '}
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-secondary">
                      {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-secondary">
              <FiList className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                <Link to="/transactions/add" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  Add transaction
                </Link>
                <span className="hidden sm:inline text-secondary">or</span>
                <Link to="/clients/add" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  Add client
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 