import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Database, 
  Cloud, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { 
  CostMonitor, 
  UsageTracker, 
  CostEstimate, 
  UsageMetrics, 
  CostAlert 
} from '../utils/costMonitoring';

interface CostMonitoringDashboardProps {
  className?: string;
}

export default function CostMonitoringDashboard({ className }: CostMonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [costs, setCosts] = useState<CostEstimate | null>(null);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [projectedMonthlyCost, setProjectedMonthlyCost] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tracker = UsageTracker.getInstance();

  useEffect(() => {
    refreshData();
    
    // Set up alert listener
    const handleAlerts = (newAlerts: CostAlert[]) => {
      setAlerts(newAlerts);
    };
    
    tracker.addAlertListener(handleAlerts);
    
    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000);
    
    return () => {
      tracker.removeAlertListener(handleAlerts);
      clearInterval(interval);
    };
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    
    try {
      const currentMetrics = tracker.getMetrics();
      const currentCosts = tracker.getCurrentCosts();
      const currentAlerts = tracker.getAlerts();
      
      setMetrics(currentMetrics);
      setCosts(currentCosts);
      setAlerts(currentAlerts);
      
      // Calculate projections and recommendations
      const dayOfMonth = new Date().getDate();
      const projected = CostMonitor.projectMonthlyCost(currentCosts.total, dayOfMonth);
      setProjectedMonthlyCost(projected);
      
      const recs = CostMonitor.generateOptimizationRecommendations(currentMetrics, currentCosts);
      setRecommendations(recs);
      
      const score = CostMonitor.getEfficiencyScore(currentMetrics, currentCosts);
      setEfficiencyScore(score);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (!metrics || !costs) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cost Monitoring Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time Firebase usage and cost tracking
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Cost Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(-3).map((alert) => (
            <Alert key={alert.id} className={alert.type === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className={alert.type === 'critical' ? 'text-red-700' : 'text-yellow-700'}>
                  {alert.message}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(costs.total)}</div>
            <p className="text-xs text-muted-foreground">
              {costs.total > 1 ? 'Above free tier' : 'Within free tier'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Monthly</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedMonthlyCost)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(efficiencyScore)}`}>
              {efficiencyScore}%
            </div>
            <div className="mt-1">
              {getEfficiencyBadge(efficiencyScore)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.type === 'critical').length} critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Service Costs Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Firestore</span>
                <span className="font-medium">{formatCurrency(costs.firestore)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(costs.firestore / Math.max(costs.total, 0.01)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage</span>
                <span className="font-medium">{formatCurrency(costs.storage)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(costs.storage / Math.max(costs.total, 0.01)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Functions</span>
                <span className="font-medium">{formatCurrency(costs.functions)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(costs.functions / Math.max(costs.total, 0.01)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bandwidth</span>
                <span className="font-medium">{formatCurrency(costs.bandwidth)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${(costs.bandwidth / Math.max(costs.total, 0.01)) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Firestore Reads</p>
                <p className="text-xl font-bold">{formatNumber(metrics.firestoreReads)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Firestore Writes</p>
                <p className="text-xl font-bold">{formatNumber(metrics.firestoreWrites)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xl font-bold">
                  {(metrics.storageBytes / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Function Calls</p>
                <p className="text-xl font-bold">{formatNumber(metrics.functionInvocations)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Cost Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost-saving tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Cost-Saving Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-400">✅ Implemented Optimizations</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Query filtering by accountId</li>
                <li>• Pagination for large datasets</li>
                <li>• Minimal Cloud Function resources</li>
                <li>• Image compression and optimization</li>
                <li>• Aggressive caching strategies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-400">💡 Additional Tips</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Set up automated old data cleanup</li>
                <li>• Monitor usage during peak hours</li>
                <li>• Use Cloud Functions sparingly</li>
                <li>• Implement client-side caching</li>
                <li>• Optimize image sizes before upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
