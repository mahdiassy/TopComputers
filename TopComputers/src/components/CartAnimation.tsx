import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface CartAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function CartAnimation({ isVisible, onComplete }: CartAnimationProps) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show the check mark animation
      const timer1 = setTimeout(() => {
        setShowCheck(true);
      }, 200);

      const timer2 = setTimeout(() => {
        setShowCheck(false);
        onComplete();
      }, 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="relative">
        {/* Success Check Mark Animation */}
        {showCheck && (
          <div className="transform transition-all duration-300 animate-bounce">
            <div className="bg-green-500 text-white p-4 rounded-full shadow-2xl">
              <Check className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
