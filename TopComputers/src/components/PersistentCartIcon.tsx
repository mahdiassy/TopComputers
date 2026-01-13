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
      className="hidden md:block fixed bottom-6 right-6 z-50 group bg-transparent border-0 p-0 outline-none rounded-full"
    >
      <div className="relative">
        {/* Cart Icon */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-pink-600 text-white p-4 rounded-full shadow-2xl dark:shadow-orange-500/50 hover:shadow-3xl transition-all duration-300 hover:scale-110 group-hover:from-blue-700 group-hover:to-indigo-700 dark:group-hover:from-orange-400 dark:group-hover:to-pink-500 border-2 border-white/20 dark:border-white/30">
          <ShoppingCart className="h-6 w-6" />
        </div>
        
        {/* Item Count Badge */}
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 dark:from-yellow-400 dark:to-orange-500 text-white dark:text-gray-900 text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse shadow-lg dark:shadow-yellow-400/50 border-2 border-white dark:border-gray-900">
            {itemCount}
          </div>
        )}
        
        {/* Hover Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl border dark:border-gray-300">
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'Cart is empty'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
        </div>
      </div>
    </button>
  );
}
