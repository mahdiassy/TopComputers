import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Filter,
  Search,
  X,
  Calendar
} from 'lucide-react';
import { useActivity } from '../contexts/ActivityContext';

interface ActivityLogProps {}

const AdminActivityLog: React.FC<ActivityLogProps> = () => {
  const { activities, getActivitiesByType, clearActivities } = useActivity();
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const activityTypes = [
    { value: 'all', label: 'All Types', count: activities.length },
    { value: 'product', label: 'Products', count: getActivitiesByType('product').length },
    { value: 'category', label: 'Categories', count: getActivitiesByType('category').length },
    { value: 'brand', label: 'Brands', count: getActivitiesByType('brand').length },
    { value: 'service', label: 'Services', count: getActivitiesByType('service').length },
    { value: 'subservice', label: 'Sub-Services', count: getActivitiesByType('subservice').length },
    { value: 'user', label: 'Users', count: getActivitiesByType('user').length },
    { value: 'settings', label: 'Settings', count: getActivitiesByType('settings').length }
  ];

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'viewed', label: 'Viewed' }
  ];

  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action === actionFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [activities, typeFilter, actionFilter, searchTerm]);

  const getActivityIcon = (type: string, action: string) => {
    if (action === 'created') return <Plus className="h-4 w-4 text-green-500" />;
    if (action === 'deleted') return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action === 'updated') return <RefreshCw className="h-4 w-4 text-blue-500" />;
    if (action === 'viewed') return <Eye className="h-4 w-4 text-gray-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      product: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      category: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      brand: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      user: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      service: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      subservice: 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
      settings: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
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
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearAllActivities = () => {
    if (window.confirm('Are you sure you want to clear all activity history? This action cannot be undone.')) {
      clearActivities();
      setFilteredActivities([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Activity className="h-6 w-6 mr-3 text-blue-600" />
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete history of all admin actions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={clearAllActivities}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {actionTypes.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Activities ({filteredActivities.length})
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {activities.length} total activities
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type, activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {activity.action}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.title}
                    </h4>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFullDate(activity.timestamp)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || typeFilter !== 'all' || actionFilter !== 'all' 
                  ? 'Try adjusting your filters to see more activities.'
                  : 'No activities have been recorded yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLog;





