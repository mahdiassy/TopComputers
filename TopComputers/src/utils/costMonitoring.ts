/**
 * COST OPTIMIZATION: Firebase cost monitoring and alerting system
 * Track usage patterns and alert when costs might exceed budget
 */

export interface UsageMetrics {
  firestoreReads: number;
  firestoreWrites: number;
  firestoreDeletes: number;
  storageBytes: number;
  functionInvocations: number;
  bandwidthGB: number;
  timestamp: Date;
}

export interface CostEstimate {
  firestore: number;
  storage: number;
  functions: number;
  bandwidth: number;
  total: number;
}

export interface CostAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  currentCost: number;
  threshold: number;
  timestamp: Date;
}

export class CostMonitor {
  // Firebase pricing (as of 2024 - verify current rates)
  private static readonly PRICING = {
    firestore: {
      reads: 0.06 / 100000,      // $0.06 per 100K reads
      writes: 0.18 / 100000,     // $0.18 per 100K writes
      deletes: 0.02 / 100000,    // $0.02 per 100K deletes
    },
    storage: 0.026 / (1024 * 1024 * 1024), // $0.026 per GB/month
    functions: {
      invocations: 0.40 / 1000000,         // $0.40 per 1M invocations
      compute: 0.0000025,                  // $0.0000025 per GB-second
    },
    bandwidth: 0.12 / (1024 * 1024 * 1024), // $0.12 per GB
  };

  private static readonly COST_THRESHOLDS = {
    daily: {
      warning: 5,    // $5/day
      critical: 10,  // $10/day
    },
    monthly: {
      warning: 50,   // $50/month
      critical: 100, // $100/month
    },
  };

  /**
   * Calculate estimated costs based on usage metrics
   */
  static calculateCosts(metrics: UsageMetrics): CostEstimate {
    const firestore = 
      (metrics.firestoreReads * this.PRICING.firestore.reads) +
      (metrics.firestoreWrites * this.PRICING.firestore.writes) +
      (metrics.firestoreDeletes * this.PRICING.firestore.deletes);

    const storage = metrics.storageBytes * this.PRICING.storage;
    
    const functions = 
      (metrics.functionInvocations * this.PRICING.functions.invocations) +
      (metrics.functionInvocations * 0.1 * this.PRICING.functions.compute); // Assuming 0.1 GB-second per invocation

    const bandwidth = metrics.bandwidthGB * this.PRICING.bandwidth;

    const total = firestore + storage + functions + bandwidth;

    return {
      firestore: parseFloat(firestore.toFixed(4)),
      storage: parseFloat(storage.toFixed(4)),
      functions: parseFloat(functions.toFixed(4)),
      bandwidth: parseFloat(bandwidth.toFixed(4)),
      total: parseFloat(total.toFixed(4)),
    };
  }

  /**
   * Check if current usage triggers any cost alerts
   */
  static checkCostAlerts(
    dailyCost: number,
    monthlyCost: number,
    projectedMonthlyCost: number
  ): CostAlert[] {
    const alerts: CostAlert[] = [];

    // Daily cost alerts
    if (dailyCost >= this.COST_THRESHOLDS.daily.critical) {
      alerts.push({
        id: `daily-critical-${Date.now()}`,
        type: 'critical',
        message: `Daily cost of $${dailyCost.toFixed(2)} exceeds critical threshold of $${this.COST_THRESHOLDS.daily.critical}`,
        currentCost: dailyCost,
        threshold: this.COST_THRESHOLDS.daily.critical,
        timestamp: new Date(),
      });
    } else if (dailyCost >= this.COST_THRESHOLDS.daily.warning) {
      alerts.push({
        id: `daily-warning-${Date.now()}`,
        type: 'warning',
        message: `Daily cost of $${dailyCost.toFixed(2)} exceeds warning threshold of $${this.COST_THRESHOLDS.daily.warning}`,
        currentCost: dailyCost,
        threshold: this.COST_THRESHOLDS.daily.warning,
        timestamp: new Date(),
      });
    }

    // Monthly cost alerts
    if (monthlyCost >= this.COST_THRESHOLDS.monthly.critical) {
      alerts.push({
        id: `monthly-critical-${Date.now()}`,
        type: 'critical',
        message: `Monthly cost of $${monthlyCost.toFixed(2)} exceeds critical threshold of $${this.COST_THRESHOLDS.monthly.critical}`,
        currentCost: monthlyCost,
        threshold: this.COST_THRESHOLDS.monthly.critical,
        timestamp: new Date(),
      });
    } else if (monthlyCost >= this.COST_THRESHOLDS.monthly.warning) {
      alerts.push({
        id: `monthly-warning-${Date.now()}`,
        type: 'warning',
        message: `Monthly cost of $${monthlyCost.toFixed(2)} exceeds warning threshold of $${this.COST_THRESHOLDS.monthly.warning}`,
        currentCost: monthlyCost,
        threshold: this.COST_THRESHOLDS.monthly.warning,
        timestamp: new Date(),
      });
    }

    // Projected monthly cost alerts
    if (projectedMonthlyCost >= this.COST_THRESHOLDS.monthly.critical * 1.2) {
      alerts.push({
        id: `projected-critical-${Date.now()}`,
        type: 'critical',
        message: `Projected monthly cost of $${projectedMonthlyCost.toFixed(2)} may exceed budget. Consider optimization.`,
        currentCost: projectedMonthlyCost,
        threshold: this.COST_THRESHOLDS.monthly.critical,
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Generate cost optimization recommendations based on usage patterns
   */
  static generateOptimizationRecommendations(
    metrics: UsageMetrics,
    costs: CostEstimate
  ): string[] {
    const recommendations: string[] = [];

    // Firestore optimization recommendations
    if (costs.firestore > costs.total * 0.5) {
      recommendations.push(
        "Firestore costs are high. Consider implementing more aggressive caching and pagination."
      );
      
      if (metrics.firestoreReads > metrics.firestoreWrites * 10) {
        recommendations.push(
          "High read-to-write ratio detected. Implement client-side caching to reduce repeated reads."
        );
      }
    }

    // Storage optimization recommendations
    if (costs.storage > costs.total * 0.3) {
      recommendations.push(
        "Storage costs are significant. Consider image optimization and cleanup of unused files."
      );
    }

    // Function optimization recommendations
    if (costs.functions > costs.total * 0.3) {
      recommendations.push(
        "Cloud Functions costs are high. Review function memory allocation and execution time."
      );
    }

    // Bandwidth optimization recommendations
    if (costs.bandwidth > costs.total * 0.2) {
      recommendations.push(
        "Bandwidth costs are elevated. Implement better caching and image compression."
      );
    }

    // General recommendations if no specific issues
    if (recommendations.length === 0 && costs.total > 1) {
      recommendations.push(
        "Consider implementing query result caching and regular cleanup of old data."
      );
    }

    return recommendations;
  }

  /**
   * Format cost breakdown for display
   */
  static formatCostBreakdown(costs: CostEstimate): string {
    const breakdown = [
      `Firestore: $${costs.firestore.toFixed(4)}`,
      `Storage: $${costs.storage.toFixed(4)}`,
      `Functions: $${costs.functions.toFixed(4)}`,
      `Bandwidth: $${costs.bandwidth.toFixed(4)}`,
      `Total: $${costs.total.toFixed(4)}`,
    ];

    return breakdown.join('\n');
  }

  /**
   * Estimate monthly projection based on current daily usage
   */
  static projectMonthlyCost(dailyCost: number, dayOfMonth: number): number {
    if (dayOfMonth === 0) return 0;
    
    const daysInMonth = 30; // Approximate
    const averageDailyCost = dailyCost / dayOfMonth;
    return averageDailyCost * daysInMonth;
  }

  /**
   * Get usage efficiency score (0-100)
   */
  static getEfficiencyScore(metrics: UsageMetrics, costs: CostEstimate): number {
    let score = 100;

    // Penalize high costs relative to activity
    const costPerRead = costs.firestore / (metrics.firestoreReads || 1);
    if (costPerRead > 0.001) score -= 20;

    // Penalize high storage without proportional reads
    const storageToReadsRatio = metrics.storageBytes / (metrics.firestoreReads || 1);
    if (storageToReadsRatio > 1000000) score -= 15; // 1MB per read

    // Penalize excessive function invocations
    const functionToWriteRatio = metrics.functionInvocations / (metrics.firestoreWrites || 1);
    if (functionToWriteRatio > 5) score -= 15;

    // Penalize high bandwidth usage
    if (metrics.bandwidthGB > 1) score -= 10;

    return Math.max(0, score);
  }
}

/**
 * Usage tracking hook for React components
 */
export class UsageTracker {
  private static instance: UsageTracker;
  private metrics: UsageMetrics;
  private alerts: CostAlert[] = [];
  private listeners: Array<(alerts: CostAlert[]) => void> = [];

  private constructor() {
    this.metrics = {
      firestoreReads: 0,
      firestoreWrites: 0,
      firestoreDeletes: 0,
      storageBytes: 0,
      functionInvocations: 0,
      bandwidthGB: 0,
      timestamp: new Date(),
    };

    // Load saved metrics from localStorage
    this.loadSavedMetrics();
    
    // Save metrics periodically
    setInterval(() => this.saveMetrics(), 60000); // Save every minute
  }

  static getInstance(): UsageTracker {
    if (!this.instance) {
      this.instance = new UsageTracker();
    }
    return this.instance;
  }

  /**
   * Track Firestore read operation
   */
  trackFirestoreRead(count: number = 1): void {
    this.metrics.firestoreReads += count;
    this.checkAndUpdateAlerts();
  }

  /**
   * Track Firestore write operation
   */
  trackFirestoreWrite(count: number = 1): void {
    this.metrics.firestoreWrites += count;
    this.checkAndUpdateAlerts();
  }

  /**
   * Track Firestore delete operation
   */
  trackFirestoreDelete(count: number = 1): void {
    this.metrics.firestoreDeletes += count;
    this.checkAndUpdateAlerts();
  }

  /**
   * Track storage usage
   */
  trackStorageUsage(bytes: number): void {
    this.metrics.storageBytes = Math.max(this.metrics.storageBytes, bytes);
    this.checkAndUpdateAlerts();
  }

  /**
   * Track function invocation
   */
  trackFunctionInvocation(count: number = 1): void {
    this.metrics.functionInvocations += count;
    this.checkAndUpdateAlerts();
  }

  /**
   * Track bandwidth usage
   */
  trackBandwidth(bytes: number): void {
    this.metrics.bandwidthGB += bytes / (1024 * 1024 * 1024);
    this.checkAndUpdateAlerts();
  }

  /**
   * Get current metrics
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current cost estimate
   */
  getCurrentCosts(): CostEstimate {
    return CostMonitor.calculateCosts(this.metrics);
  }

  /**
   * Get current alerts
   */
  getAlerts(): CostAlert[] {
    return [...this.alerts];
  }

  /**
   * Add alert listener
   */
  addAlertListener(listener: (alerts: CostAlert[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove alert listener
   */
  removeAlertListener(listener: (alerts: CostAlert[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Reset daily metrics (call at midnight)
   */
  resetDailyMetrics(): void {
    this.metrics = {
      firestoreReads: 0,
      firestoreWrites: 0,
      firestoreDeletes: 0,
      storageBytes: this.metrics.storageBytes, // Keep storage as it's cumulative
      functionInvocations: 0,
      bandwidthGB: 0,
      timestamp: new Date(),
    };
    this.saveMetrics();
  }

  private checkAndUpdateAlerts(): void {
    const costs = this.getCurrentCosts();
    const dailyCost = costs.total;
    const monthlyCost = dailyCost * 30; // Rough estimation
    const projectedMonthlyCost = CostMonitor.projectMonthlyCost(dailyCost, new Date().getDate());

    const newAlerts = CostMonitor.checkCostAlerts(dailyCost, monthlyCost, projectedMonthlyCost);
    
    if (newAlerts.length > 0) {
      this.alerts = [...this.alerts, ...newAlerts];
      // Keep only last 50 alerts
      this.alerts = this.alerts.slice(-50);
      
      // Notify listeners
      this.listeners.forEach(listener => listener(this.alerts));
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('firebase-usage-metrics', JSON.stringify({
        ...this.metrics,
        timestamp: this.metrics.timestamp.toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to save usage metrics:', error);
    }
  }

  private loadSavedMetrics(): void {
    try {
      const saved = localStorage.getItem('firebase-usage-metrics');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedDate = new Date(parsed.timestamp);
        const today = new Date();
        
        // Only load metrics from today
        if (savedDate.toDateString() === today.toDateString()) {
          this.metrics = {
            ...parsed,
            timestamp: savedDate,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load saved usage metrics:', error);
    }
  }
}

export default CostMonitor;
