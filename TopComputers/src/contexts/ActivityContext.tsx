import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Activity {
  id: string;
  type: 'product' | 'category' | 'brand' | 'user' | 'service' | 'subservice' | 'order' | 'settings';
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'restocked' | 'status_changed';
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getRecentActivities: (limit?: number) => Activity[];
  getActivitiesByType: (type: Activity['type']) => Activity[];
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('admin_activities');
    if (savedActivities) {
      try {
        const parsed = JSON.parse(savedActivities);
        const activitiesWithDates = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        setActivities(activitiesWithDates);
      } catch (error) {
        console.error('Error loading activities from localStorage:', error);
      }
    }
  }, []);

  // Save activities to localStorage whenever activities change
  useEffect(() => {
    localStorage.setItem('admin_activities', JSON.stringify(activities));
  }, [activities]);

  const addActivity = (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep only last 100 activities
  };

  const getRecentActivities = (limit: number = 10) => {
    return activities.slice(0, limit);
  };

  const getActivitiesByType = (type: Activity['type']) => {
    return activities.filter(activity => activity.type === type);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('admin_activities');
  };

  const value: ActivityContextType = {
    activities,
    addActivity,
    getRecentActivities,
    getActivitiesByType,
    clearActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};





