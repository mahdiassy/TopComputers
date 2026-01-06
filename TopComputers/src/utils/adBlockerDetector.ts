/**
 * Utility to detect if Firebase requests are being blocked by ad blockers
 */

// Function to check if Firebase requests are being blocked
export async function checkFirebaseBlocking(): Promise<boolean> {
  try {
    // Try to fetch from a Firebase domain that ad blockers typically block
    const testUrl = 'https://firestore.googleapis.com/favicon.ico';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch(testUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // If we get here, the request wasn't blocked
    return false;
  } catch (error) {
    // If we get an error, it might be blocked by an ad blocker
    // Check if it's a network error or abort error
    if (
      error instanceof Error && 
      (error.name === 'TypeError' || error.name === 'AbortError' || error.message.includes('Failed to fetch'))
    ) {
      return true;
    }
    
    // Other errors might not be related to blocking
    return false;
  }
}

// Function to show a warning to the user if Firebase is blocked
export function showFirebaseBlockedWarning() {
  const warningDiv = document.createElement('div');
  warningDiv.style.position = 'fixed';
  warningDiv.style.top = '0';
  warningDiv.style.left = '0';
  warningDiv.style.right = '0';
  warningDiv.style.padding = '10px';
  warningDiv.style.backgroundColor = '#f44336';
  warningDiv.style.color = 'white';
  warningDiv.style.textAlign = 'center';
  warningDiv.style.zIndex = '9999';
  warningDiv.style.fontWeight = 'bold';
  
  warningDiv.innerHTML = `
    ⚠️ Ad blocker detected! Firebase connections are being blocked. 
    Please disable your ad blocker or add this site to your allowlist to use all features.
    <button id="close-warning" style="margin-left: 10px; padding: 2px 8px; background: white; color: #f44336; border: none; border-radius: 4px; cursor: pointer;">
      Dismiss
    </button>
  `;
  
  document.body.appendChild(warningDiv);
  
  // Add event listener to close button
  document.getElementById('close-warning')?.addEventListener('click', () => {
    warningDiv.remove();
  });
}
