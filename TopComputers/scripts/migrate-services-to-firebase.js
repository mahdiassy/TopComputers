/**
 * Migration Script: Transfer Services from localStorage to Firebase
 * 
 * This script helps migrate existing service data from localStorage to Firebase Firestore.
 * Run this script in the browser console on your admin panel to transfer data.
 */

// Migration function to run in browser console
function migrateServicesToFirebase() {
  console.log('🔄 Starting services migration from localStorage to Firebase...');
  
  try {
    // Check if there's existing localStorage data
    const storedMainServices = localStorage.getItem('mainServices');
    const storedSubServices = localStorage.getItem('subServices');
    
    if (!storedMainServices && !storedSubServices) {
      console.log('ℹ️ No localStorage services data found. Nothing to migrate.');
      return;
    }
    
    let mainServices = [];
    let subServices = [];
    
    try {
      if (storedMainServices) {
        mainServices = JSON.parse(storedMainServices);
        console.log(`📦 Found ${mainServices.length} main services in localStorage`);
      }
      
      if (storedSubServices) {
        subServices = JSON.parse(storedSubServices);
        console.log(`📦 Found ${subServices.length} sub-services in localStorage`);
      }
    } catch (parseError) {
      console.error('❌ Error parsing localStorage data:', parseError);
      return;
    }
    
    // Display what we found
    if (mainServices.length > 0) {
      console.log('📋 Main Services to migrate:');
      mainServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title} (ID: ${service.id})`);
      });
    }
    
    if (subServices.length > 0) {
      console.log('📋 Sub-Services to migrate:');
      subServices.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.title} (Main Service ID: ${service.mainServiceId})`);
      });
    }
    
    console.log('\n🚨 IMPORTANT: Manual Migration Required');
    console.log('Due to security restrictions, this script cannot directly write to Firebase.');
    console.log('Please follow these steps to complete the migration:');
    console.log('\n1. Copy the data below');
    console.log('2. Go to your admin services page');
    console.log('3. Manually recreate each service using the admin interface');
    console.log('4. After migration is complete, run: clearLocalStorageServices()');
    
    // Output the data for manual migration
    if (mainServices.length > 0) {
      console.log('\n📝 MAIN SERVICES DATA:');
      console.log(JSON.stringify(mainServices, null, 2));
    }
    
    if (subServices.length > 0) {
      console.log('\n📝 SUB-SERVICES DATA:');
      console.log(JSON.stringify(subServices, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Function to clear localStorage after successful migration
function clearLocalStorageServices() {
  const hasMainServices = localStorage.getItem('mainServices');
  const hasSubServices = localStorage.getItem('subServices');
  
  if (hasMainServices || hasSubServices) {
    const confirmClear = confirm(
      '⚠️ This will permanently delete services data from localStorage.\n\n' +
      'Only proceed if you have successfully migrated all services to Firebase.\n\n' +
      'Continue with cleanup?'
    );
    
    if (confirmClear) {
      localStorage.removeItem('mainServices');
      localStorage.removeItem('subServices');
      console.log('✅ localStorage services data cleared successfully');
      alert('✅ Migration cleanup completed! localStorage services data has been removed.');
    } else {
      console.log('ℹ️ Cleanup cancelled by user');
    }
  } else {
    console.log('ℹ️ No localStorage services data found to clear');
  }
}

// Auto-run migration check
console.log('📱 Service Migration Script Loaded');
console.log('Run migrateServicesToFirebase() to start migration');
console.log('Run clearLocalStorageServices() after successful migration');

// For immediate execution, uncomment the next line:
// migrateServicesToFirebase();
