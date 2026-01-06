import { useState } from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { FiChevronDown, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AccountSwitcher = () => {
  const { accounts, currentAccount, switchAccount, loading } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);

  const handleAccountSwitch = async (accountId: string) => {
    try {
      await switchAccount(accountId);
      setIsOpen(false);
      toast.success('Account switched successfully');
    } catch (error) {
      toast.error('Failed to switch account');
    }
  };

  if (loading || !currentAccount) {
    return (
      <div className="flex items-center space-x-1 sm:space-x-2 text-secondary">
        <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer"
      >
        <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-primary font-medium max-w-16 sm:max-w-32 truncate">
          {currentAccount.name}
        </span>
        <FiChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 mx-4 sm:mx-0">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-secondary border-b border-gray-200 dark:border-gray-700">
                Switch Account
              </div>
              
              {accounts
                .sort((a, b) => {
                  // Sort by creation date - oldest first (Personal Finance should be first)
                  const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
                  const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
                  return aTime - bTime;
                })
                .map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSwitch(account.id)}
                  className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 cursor-pointer ${
                    account.id === currentAccount.id 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-primary'
                  }`}
                >
                  <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{account.name}</div>
                    {account.description && (
                      <div className="text-xs text-secondary truncate">{account.description}</div>
                    )}
                  </div>
                  {account.id === currentAccount.id && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountSwitcher;
