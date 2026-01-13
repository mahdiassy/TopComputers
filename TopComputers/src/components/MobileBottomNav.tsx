import { Home, Package, Wrench, ShoppingCart, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cart } = useCart();
  const cartItemCount = cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/catalog', icon: Package, label: 'Products' },
    { to: '/services', icon: Wrench, label: 'Services' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItemCount > 0 ? cartItemCount : undefined },
    { to: '/contact', icon: Phone, label: 'Contact' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 z-50 shadow-lg dark:shadow-blue-500/20">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-orange-400 bg-blue-50 dark:bg-orange-900/30 font-bold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-pink-600 dark:from-yellow-400 dark:to-orange-500 text-white dark:text-gray-900 text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-md dark:shadow-yellow-400/50 border border-white dark:border-gray-800">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
