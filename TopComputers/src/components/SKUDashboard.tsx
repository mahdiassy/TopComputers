import React, { useState, useEffect } from 'react';
import { Hash, TrendingUp, Package, AlertCircle } from 'lucide-react';

interface SKUStats {
  totalProducts: number;
  lastUsedSKU: string;
  nextAvailableSKU: string;
  skuGaps: string[];
  recentSKUs: { sku: string; productTitle: string; createdAt: string }[];
}

export default function SKUDashboard() {
  const [stats, setStats] = useState<SKUStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSKUStats = async () => {
      try {
        const { SKUManager } = await import('../utils/skuManager');
        
        // Get all used SKUs
        const usedSKUs = await SKUManager.getAllUsedSKUs();
        const nextSKU = await SKUManager.getNextAvailableSKU();
        
        // Find gaps in SKU sequence
        const skuNumbers = usedSKUs
          .map(sku => {
            const match = sku.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          })
          .filter(num => num !== null)
          .sort((a, b) => a! - b!);
        
        const gaps: string[] = [];
        if (skuNumbers.length > 0) {
          const min = Math.min(...skuNumbers as number[]);
          const max = Math.max(...skuNumbers as number[]);
          
          for (let i = min; i < max; i++) {
            if (!skuNumbers.includes(i)) {
              gaps.push(`TC${i}`);
            }
          }
        }
        
        setStats({
          totalProducts: usedSKUs.length,
          lastUsedSKU: usedSKUs[usedSKUs.length - 1] || 'None',
          nextAvailableSKU: nextSKU,
          skuGaps: gaps.slice(0, 10), // Show first 10 gaps
          recentSKUs: [] // Would need to fetch from products collection with timestamps
        });
      } catch (error) {
        console.error('Error loading SKU stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSKUStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Unable to load SKU statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Hash className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          SKU Management Overview
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Products</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                {stats.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Next Available</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                {stats.nextAvailableSKU}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Hash className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                {stats.lastUsedSKU}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">SKU Gaps</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                {stats.skuGaps.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {stats.skuGaps.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Available SKU Gaps (can be reused):
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.skuGaps.map(sku => (
              <span
                key={sku}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
              >
                {sku}
              </span>
            ))}
            {stats.skuGaps.length > 10 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{stats.skuGaps.length - 10} more
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            These SKUs are available for reuse if needed
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          SKU System Features:
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Auto-generates SKUs starting from TC100</li>
          <li>• Real-time duplicate checking</li>
          <li>• Suggests next available SKU automatically</li>
          <li>• Allows manual editing with validation</li>
          <li>• Tracks gaps for efficient SKU management</li>
        </ul>
      </div>
    </div>
  );
}
