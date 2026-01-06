import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Folder, 
  Tag, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye,
  Users,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  Clock,
  ShoppingCart,
  Settings,
  Briefcase,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useActivity } from '../contexts/ActivityContext';
import { useServices } from '../contexts/ServicesContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  link?: string;
  color: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, link, color }: StatCardProps) {
  const CardContent = (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center text-sm font-medium ${
              changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (link) {
    return <Link to={link}>{CardContent}</Link>;
  }

  return CardContent;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  color: string;
  count?: number;
}

function QuickAction({ title, description, icon: Icon, link, color, count }: QuickActionProps) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {count !== undefined && (
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
          <span>Manage</span>
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
}

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: 'product' | 'category' | 'brand' | 'user' | 'service' | 'subservice';
    action: 'created' | 'updated' | 'deleted' | 'viewed';
    title: string;
    timestamp: Date;
  }>;
}

function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string, action: string) => {
    if (action === 'created') return <Plus className="h-4 w-4 text-green-500" />;
    if (action === 'deleted') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (action === 'updated') return <RefreshCw className="h-4 w-4 text-blue-500" />;
    return <Eye className="h-4 w-4 text-gray-500" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      product: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      category: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      brand: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      user: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      service: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      subservice: 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <Link to="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View All
          </Link>
        </div>
      </div>
      <div className="p-5">
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium capitalize">
                      {activity.action}
                    </span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      "{activity.title}"
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface LowStockAlertsProps {
  products: Array<{
    id: string;
    title: string;
    stock: number;
    thumbnail: string;
  }>;
}

function LowStockAlerts({ products }: LowStockAlertsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          Low Stock Alerts
        </h3>
      </div>
      <div className="p-5">
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Only {product.stock} left in stock
                  </p>
                </div>
                <Link
                  to={`/admin/products?id=${product.id}`}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-300 dark:text-green-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">All products are well stocked</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { products, categories, brands, loadingProducts, siteSettings } = useCatalog();
  const { activities, addActivity } = useActivity();
  const { mainServices, subServices } = useServices();
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  // Initialize with some sample activities if none exist
  useEffect(() => {
    if (activities.length === 0) {
      const sampleActivities = [
        {
          type: 'product' as const,
          action: 'created' as const,
          title: 'Gaming Laptop XYZ',
          description: 'New gaming laptop added to catalog'
        },
        {
          type: 'category' as const,
          action: 'updated' as const,
          title: 'Laptops',
          description: 'Updated laptop category settings'
        },
        {
          type: 'service' as const,
          action: 'created' as const,
          title: 'Computer Repair Service',
          description: 'Added new repair service'
        }
      ];

      sampleActivities.forEach(activity => {
        addActivity(activity);
      });
    }
  }, [activities.length, addActivity]);

  useEffect(() => {
    // Find products with low stock
    const lowStockThreshold = siteSettings?.notifications?.lowStockThreshold || 5;
    const lowStock = products
      .filter(product => product.stock < lowStockThreshold && product.stock > 0)
      .sort((a, b) => a.stock - b.stock);
    setLowStockProducts(lowStock);
  }, [products, siteSettings]);

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.active).length,
    totalBrands: brands.length,
    activeBrands: brands.filter(b => b.active).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  const quickActions = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      link: '/admin/products',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      count: stats.totalProducts
    },
    {
      title: 'Categories',
      description: 'Organize product categories',
      icon: Folder,
      link: '/admin/categories',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      count: stats.totalCategories
    },
    {
      title: 'Brands',
      description: 'Manage brand partnerships',
      icon: Tag,
      link: '/admin/brands',
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      count: stats.totalBrands
    },
    {
      title: 'Services',
      description: 'Manage services & sub-services',
      icon: Briefcase,
      link: '/admin/services',
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      count: mainServices.length
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      icon: Users,
      link: '/admin/users',
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      count: 0
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gradient-to-br from-gray-500 to-slate-600',
      count: 0
    }
  ];

  if (loadingProducts) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">Manage your TopComputers store efficiently</p>
      </div>

      {/* Key Metrics - Only Inventory Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          change="+8.2%"
          changeType="increase"
          icon={DollarSign}
          color="bg-gradient-to-br from-orange-500 to-red-500"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon={TrendingDown}
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={AlertCircle}
          color="bg-gradient-to-br from-red-500 to-pink-500"
        />
        <StatCard
          title="Total Revenue"
          value="$0"
          change="+0%"
          changeType="increase"
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <QuickAction
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              link={action.link}
              color={action.color}
              count={action.count}
            />
          ))}
        </div>
      </div>

      {/* Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={activities} />
        <LowStockAlerts products={lowStockProducts} />
      </div>

    </div>
  );
}