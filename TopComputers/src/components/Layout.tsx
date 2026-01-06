import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiList, FiSettings, FiLogOut, FiPlusCircle, FiMenu, FiX, FiUsers } from 'react-icons/fi';
import AccountSwitcher from './AccountSwitcher';

const Layout = () => {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Silent fail for production
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 lg:justify-center">
          <div className="flex items-center">
            <img 
              src="/logo-transparent.png" 
              alt="Company Logo" 
              className="h-16 w-auto object-contain dark:filter dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
            />
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-md text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-4 py-2">
          <div className="text-sm text-gray-600">Logged in as:</div>
          <div className="font-medium text-gray-900 truncate">{userData?.username || currentUser?.email}</div>
        </div>
        
        <nav className="mt-8">
          <ul>
            <li>
              <Link 
                to="/" 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900'
                }`}
              >
                <FiHome className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/transactions" 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive('/transactions') 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900'
                }`}
              >
                <FiList className="mr-3" />
                Transactions
              </Link>
            </li>
            <li>
              <Link 
                to="/transactions/add" 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive('/transactions/add') 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900'
                }`}
              >
                <FiPlusCircle className="mr-3" />
                Add Transaction
              </Link>
            </li>
            <li>
              <Link 
                to="/budget" 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive('/budget') 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900'
                }`}
              >
                <FiUsers className="mr-3" />
                Budget Categories
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3 transition-colors ${
                  isActive('/settings') 
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-gray-900'
                }`}
              >
                <FiSettings className="mr-3" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
          <button 
            onClick={() => {
              handleLogout();
              closeSidebar();
            }} 
            className="flex items-center w-full px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 cursor-pointer"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Desktop header */}
        <header className="hidden lg:flex bg-white shadow-sm border-b border-gray-200 p-4 justify-end">
          <AccountSwitcher />
        </header>

        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/transactions' && 'Transactions'}
              {location.pathname === '/transactions/add' && 'Add Transaction'}
              {location.pathname.startsWith('/transactions/edit') && 'Edit Transaction'}
              {location.pathname === '/budget' && 'Budget Categories'}
              {location.pathname === '/budget/add' && 'Add Budget Category'}
              {location.pathname.startsWith('/budget/edit') && 'Edit Budget Category'}
              {location.pathname === '/settings' && 'Settings'}
            </h2>
            <div className="flex-shrink-0">
              <AccountSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 