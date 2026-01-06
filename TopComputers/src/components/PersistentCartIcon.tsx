import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function PersistentCartIcon() {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  return (
    <button
      type="button"
      aria-label="Open cart"
      onClick={() => {
        try {
          window.dispatchEvent(new CustomEvent('open-cart'));
        } catch {}
      }}
      className="hidden md:block fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative">
        {/* Cart Icon */}
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group-hover:bg-blue-700 dark:group-hover:bg-blue-600">
          <ShoppingCart className="h-6 w-6" />
        </div>
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            {itemCount}
          </div>
        )}
        
        {/* Hover Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </div>
    </button>
  );
}
