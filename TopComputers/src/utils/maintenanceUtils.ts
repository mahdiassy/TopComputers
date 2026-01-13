/**
 * Maintenance Mode Quick Toggle Script
 * 
 * This script helps you quickly enable/disable maintenance mode from the browser console.
 * Only works when logged in as an admin.
 * 
 * Usage in Browser Console:
 * 
 * // Enable maintenance mode
 * await toggleMaintenance(true);
 * 
 * // Disable maintenance mode
 * await toggleMaintenance(false);
 * 
 * // Check current status
 * await checkMaintenanceStatus();
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Toggle maintenance mode on/off
 * @param {boolean} enabled - Whether to enable or disable maintenance mode
 * @param {string} title - Optional custom title
 * @param {string} message - Optional custom message
 */
export async function toggleMaintenance(
  enabled: boolean,
  title?: string,
  message?: string
) {
  try {
    const settingsRef = doc(db, 'siteSettings', 'main');
    
    const maintenanceData = {
      'maintenance.enabled': enabled,
      ...(title && { 'maintenance.title': title }),
      ...(message && { 'maintenance.message': message }),
      updatedAt: new Date()
    };

    await updateDoc(settingsRef, maintenanceData);
    
    console.log(`✅ Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return true;
  } catch (error) {
    console.error('❌ Error toggling maintenance mode:', error);
    return false;
  }
}

/**
 * Check the current maintenance mode status
 */
export async function checkMaintenanceStatus() {
  try {
    const settingsRef = doc(db, 'siteSettings', 'main');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      const status = data.maintenance?.enabled || false;
      
      console.log('🔍 Current Maintenance Status:', {
        enabled: status,
        title: data.maintenance?.title,
        message: data.maintenance?.message
      });
      
      return data.maintenance;
    } else {
      console.log('⚠️ Site settings not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking maintenance status:', error);
    return null;
  }
}

/**
 * Quick enable with default message
 */
export async function enableMaintenanceQuick() {
  return await toggleMaintenance(
    true,
    '🔧 We\'ll Be Right Back!',
    'We\'re currently performing scheduled maintenance to improve your experience. We\'ll be back online shortly. Thank you for your patience! 💙'
  );
}

/**
 * Quick disable
 */
export async function disableMaintenanceQuick() {
  return await toggleMaintenance(false);
}

// Make functions available globally for console use (dev only)
if (import.meta.env.DEV) {
  interface MaintenanceModeUtils {
    enable: () => Promise<boolean>;
    disable: () => Promise<boolean>;
    toggle: typeof toggleMaintenance;
    status: typeof checkMaintenanceStatus;
  }
  
  (window as typeof window & { maintenanceMode: MaintenanceModeUtils }).maintenanceMode = {
    enable: enableMaintenanceQuick,
    disable: disableMaintenanceQuick,
    toggle: toggleMaintenance,
    status: checkMaintenanceStatus
  };
  
  console.log('🛠️ Maintenance Mode Utils loaded! Use: maintenanceMode.enable() or maintenanceMode.disable()');
}
