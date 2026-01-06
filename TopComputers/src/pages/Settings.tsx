import { useState } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAccounts } from '../contexts/AccountContext';
import toast from 'react-hot-toast';
import { FiDownload, FiAlertTriangle, FiShield, FiSun, FiMoon, FiHome, FiPlus, FiTrash2 } from 'react-icons/fi';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Settings = () => {
  const { transactions } = useTransactions();
  const { currentUser, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { accounts, currentAccount, addAccount, deleteAccount } = useAccounts();
  const [exportLoading, setExportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  // Removed email invitation states
  
  // Account management state
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDescription, setNewAccountDescription] = useState('');
  const [addingAccount, setAddingAccount] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  
  // Check if current user is admin using the new context method
  const userIsAdmin = isAdmin();
  
  const handleAddAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error('Account name is required');
      return;
    }
    
    try {
      setAddingAccount(true);
      await addAccount({
        name: newAccountName.trim(),
        description: newAccountDescription.trim()
      });
      
      setNewAccountName('');
      setNewAccountDescription('');
      setShowAddAccount(false);
      toast.success('Account added successfully');
    } catch (error) {
      toast.error(`Failed to add account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingAccount(false);
    }
  };
  
  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (accounts.length === 1) {
      toast.error('Cannot delete the last account');
      return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete "${accountName}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    try {
      await deleteAccount(accountId);
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };
  
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    
    setExportLoading(true);
    
    try {
      // Prepare CSV content
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(transaction => {
          const date = new Date(transaction.date).toISOString().split('T')[0];
          const type = transaction.type;
          const category = transaction.category;
          const amount = transaction.amount.toString();
          const notes = transaction.notes.replace(/,/g, ';'); // Replace commas in notes
          
          return [date, type, category, amount, notes].join(',');
        })
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleResetData = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to reset data');
      return;
    }
    
    // Check if user is admin
    if (!userIsAdmin) {
      toast.error('Admin access required');
      return;
    }
    
    const confirmText = 'DELETE ALL DATA';
    const userInput = prompt(`⚠️ ADMIN ACTION ⚠️\nThis will permanently delete ALL transactions and activity logs for ALL users. This action cannot be undone.\n\nType "${confirmText}" to confirm deletion:`);
    
    if (userInput !== confirmText) {
      return;
    }
    
    setResetLoading(true);
    
    try {
      // Get all transactions
      const transactionsRef = collection(db, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsRef);
      
      // Get all activity logs
      const logsRef = collection(db, 'activityLogs');
      const logsSnapshot = await getDocs(logsRef);
      
      // Use batch to delete everything
      const batch = writeBatch(db);
      
      transactionsSnapshot.forEach(document => {
        batch.delete(doc(db, 'transactions', document.id));
      });
      
      logsSnapshot.forEach(document => {
        batch.delete(doc(db, 'activityLogs', document.id));
      });
      
      await batch.commit();
      
      toast.success('All data has been permanently deleted');
    } catch (error) {
      toast.error('Failed to reset data');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Removed email invitation functions
  
    // Removed invitation code related useEffects
  
  return (
    <div className="space-y-4 lg:space-y-8">
      <h1 className="text-xl lg:text-2xl font-bold text-primary">Settings</h1>
      
      {/* Appearance Settings */}
      <div className="card">
        <h2 className="text-lg lg:text-xl font-bold text-primary mb-4">Appearance</h2>
        
        {/* Dark Mode Toggle */}
        <div className="py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-primary flex items-center">
                {theme === 'dark' ? <FiMoon className="mr-2 text-blue-600 dark:text-blue-400" /> : <FiSun className="mr-2 text-yellow-500" />}
                Theme
              </h3>
              <p className="text-secondary text-sm">Choose between light and dark mode</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium transition-colors ${theme === 'light' ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  Light
                </span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-gray-400/25'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-all duration-300 absolute top-1/2 left-1 -translate-y-1/2 ${
                      theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {theme === 'dark' ? (
                        <FiMoon className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FiSun className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </span>
                  <span className="sr-only">Toggle {theme === 'dark' ? 'light' : 'dark'} mode</span>
                </button>
                <span className={`text-sm font-medium transition-colors ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  Dark
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg lg:text-xl font-bold text-primary mb-4">Data Management</h2>
        
        {/* Export Data */}
        <div className="py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-primary">Export Transactions</h3>
              <p className="text-secondary text-sm">Download all transactions as a CSV file</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <FiDownload className="mr-2" />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
        
        {/* Reset Data - Only visible to admins */}
        {userIsAdmin && (
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-primary flex items-center">
                  <FiShield className="mr-2 text-red-600 dark:text-red-400" />
                  Reset All Data
                </h3>
                <p className="text-secondary text-sm">Permanently Delete All Data</p>
              </div>
              <button
                onClick={handleResetData}
                disabled={resetLoading || !currentUser}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto transition-all duration-200 cursor-pointer"
              >
                <FiAlertTriangle className="mr-2" />
                {resetLoading ? 'Resetting...' : 'Reset All Data'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Account Management Section */}
      <div className="card">
        <h2 className="text-lg lg:text-xl font-bold text-primary mb-4">Account Management</h2>
        
        {/* Current Account */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary mb-2">Current Account</h3>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <FiHome className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <div className="font-medium text-blue-800 dark:text-blue-300">{currentAccount?.name}</div>
              {currentAccount?.description && (
                <div className="text-sm text-blue-600 dark:text-blue-400">{currentAccount.description}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Account List */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary">All Accounts</h3>
            <button
              onClick={() => setShowAddAccount(!showAddAccount)}
              className="btn-primary flex items-center justify-center w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
            >
              <FiPlus className="mr-2" />
              Add Account
            </button>
          </div>
          
          {/* Add Account Form */}
          {showAddAccount && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-primary mb-3">Add New Account</h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Account name"
                    className="input-field"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={newAccountDescription}
                    onChange={(e) => setNewAccountDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="input-field"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAddAccount}
                    disabled={addingAccount || !newAccountName.trim()}
                    className="btn-primary flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiHome className="mr-2" />
                    {addingAccount ? 'Adding...' : 'Add Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAccount(false);
                      setNewAccountName('');
                      setNewAccountDescription('');
                    }}
                    className="btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Accounts List */}
          <div className="space-y-2">
            {accounts
              .sort((a, b) => {
                // Sort by creation date - oldest first (Personal Finance should be first)
                const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
                const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
                return aTime - bTime;
              })
              .map((account) => (
              <div
                key={account.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  account.id === currentAccount?.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                    : 'bg-secondary border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FiHome className={`w-4 h-4 ${
                    account.id === currentAccount?.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-secondary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${
                      account.id === currentAccount?.id 
                        ? 'text-blue-800 dark:text-blue-300' 
                        : 'text-primary'
                    }`}>
                      {account.name}
                      {account.id === currentAccount?.id && (
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    {account.description && (
                      <div className={`text-sm truncate ${
                        account.id === currentAccount?.id 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-secondary'
                      }`}>
                        {account.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {accounts.length > 1 && (
                  <button
                    onClick={() => handleDeleteAccount(account.id, account.name)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors cursor-pointer"
                    title="Delete account"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-secondary">
          <p>• Use the account switcher in the top-right corner to switch between accounts</p>
          <p>• Each account has its own separate data (transactions, budget categories, etc.)</p>
          <p>• You cannot delete an account if it's the only one remaining</p>
        </div>
      </div>
      
      {/* About Section */}
      <div className="card">
        <h2 className="text-lg lg:text-xl font-bold text-primary mb-4">About</h2>
        <p className="text-secondary">
          A React + Firebase personal finance tracking application.
        </p>
        <div className="mt-4 text-sm text-muted">
          <p>Version 1.0.0</p>
          <p>© 2024 Personal Finance Tracker.</p>
        </div>
      </div>
      
      {/* Email invitation feature removed */}
    </div>
  );
};

export default Settings; 