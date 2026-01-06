import { useEffect, useState } from 'react';
import { checkFirebaseBlocking } from '../utils/adBlockerDetector';
import toast from 'react-hot-toast';

/**
 * Component to check for ad blockers on application load
 */
const AdBlockerCheck: React.FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only check once
    if (checked) return;

    const checkForAdBlocker = async () => {
      try {
        const isBlocked = await checkFirebaseBlocking();
        if (isBlocked) {
          // Show a toast notification
          toast.error(
            (t) => (
              <div onClick={() => toast.dismiss(t.id)}>
                <strong>Ad blocker detected!</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  Firebase connections are being blocked. Please disable your ad blocker 
                  or add this site to your allowlist to use all features.
                </p>
              </div>
            ),
            {
              duration: 10000, // 10 seconds
              style: {
                maxWidth: '500px',
                padding: '16px'
              }
            }
          );
        }
        setChecked(true);
      } catch (error) {
        // Silent fail
        setChecked(true);
      }
    };

    // Run the check with a slight delay to ensure the app is fully loaded
    const timer = setTimeout(() => {
      checkForAdBlocker();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checked]);

  // This component doesn't render anything
  return null;
};

export default AdBlockerCheck;
