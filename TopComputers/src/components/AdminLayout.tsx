import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  Folder, 
  Tag, 
  Building2,
  Settings, 
  Users, 
  Archive,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Briefcase,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

function SidebarItem({ to, icon: Icon, label, isActive, isCollapsed }: SidebarItemProps) {
  return (
    <Link to={to} title={isCollapsed ? label : undefined}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        } ${isCollapsed ? 'justify-center w-12 h-12' : ''}`}
      >
        <Icon className={`h-7 w-7 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
        {!isCollapsed && <span className={isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}>{label}</span>}
      </motion.div>
    </Link>
  );
}

interface AdminLayoutProps {
  children?: React.ReactNode;
}

function AdminSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { logout, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sidebarItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/categories', icon: Folder, label: 'Categories' },
    { to: '/admin/brands', icon: Tag, label: 'Brands' },
    { to: '/admin/media', icon: Image, label: 'Media Library' },
    { to: '/admin/suppliers', icon: Building2, label: 'Suppliers' },
    { to: '/admin/services', icon: Briefcase, label: 'Services & Sub-Services' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/admin/archive', icon: Archive, label: 'Archive' },
  ];

  return (
    <div className={`bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`relative flex items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 ${
          isCollapsed ? 'justify-center p-3' : 'justify-between p-4'
        }`}>
          <Link to="/admin" className="flex items-center">
            <span
              className={`font-extrabold tracking-wide drop-shadow-lg transition-all duration-300 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent ${
                isCollapsed ? 'text-base' : 'text-2xl'
              }`}
            >
              TopComputers
            </span>
          </Link>
          {/* Corner Badge */}
          <div className="ml-auto flex items-center gap-2">
            {/* Removed admin text badge per request */}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User Menu */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 relative z-10">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              isCollapsed 
                ? 'justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={isCollapsed ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className={`h-6 w-6 ${isCollapsed ? '' : 'mr-3'} ${isCollapsed ? 'text-white animate-pulse' : ''}`} />
            ) : (
              <Moon className={`h-6 w-6 ${isCollapsed ? '' : 'mr-3'} ${isCollapsed ? 'text-white animate-pulse' : ''}`} />
            )}
            {!isCollapsed && <span>Toggle Theme</span>}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 ${
                isCollapsed ? 'justify-center w-12 h-12' : 'justify-between'
              }`}
              title={isCollapsed ? `${userData?.username || 'Admin'} - Click to open menu` : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'mr-3'}`}>
                <div className={`bg-blue-600 rounded-full flex items-center justify-center text-white font-medium ${
                  isCollapsed ? 'h-10 w-10 text-lg' : 'h-8 w-8 text-sm'
                }`}>
                  {userData?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                {!isCollapsed && (
                  <span className="ml-3 truncate">{userData?.username || 'Admin'}</span>
                )}
              </div>
              {!isCollapsed && <ChevronDown className="h-4 w-4" />}
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute ${isCollapsed ? 'left-full ml-2' : 'bottom-full mb-2'} ${
                  isCollapsed ? 'w-48' : 'w-full'
                } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2`}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg mx-1"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminHeader() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/products')) return 'Products';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/brands')) return 'Brands';
    if (path.includes('/media')) return 'Media Library';
    if (path.includes('/services')) return 'Services';
    if (path.includes('/sub-services')) return 'Sub-Services';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/archive')) return 'Archive';
    return 'Admin Panel';
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>{getPageTitle()}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Manage your TopComputers store
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Store
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen admin-layout">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full">
            <AdminSidebar 
              isCollapsed={false} 
              onToggle={() => setMobileSidebarOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-3 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/admin" className="flex items-center">
              <Package className="h-6 w-6 text-white mr-3" />
              <span className="text-lg font-bold text-white">
                Admin Panel
              </span>
            </Link>
            
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        <AdminHeader />
        
        <main className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900 min-h-screen admin-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
