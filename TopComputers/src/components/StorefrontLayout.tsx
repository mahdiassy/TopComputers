import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Home, 
  Package, 
  Grid, 
  Phone,
  Plus,
  Minus,
  Trash2,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface StorefrontLayoutProps {
  onSecretGesture?: () => void;
}

export default function StorefrontLayout({ onSecretGesture }: StorefrontLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartItemCount } = useCart();
  // Allow other components (floating cart button) to open the cart sidebar
  useEffect(() => {
    const handler = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handler as EventListener);
    return () => window.removeEventListener('open-cart', handler as EventListener);
  }, []);
  const { theme, toggleTheme } = useTheme();

  const handleLogoClick = () => {
    if (!onSecretGesture) return;
    
    setClickCount(prev => prev + 1);
    
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    if (clickCount + 1 >= 5) {
      onSecretGesture();
      setClickCount(0);
      return;
    }
    
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 3000);
    
    setClickTimer(timer);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/catalog', icon: Package },
    { name: 'Categories', href: '/categories', icon: Grid },
    { name: 'Services', href: '/services', icon: Settings },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="w-full px-1 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Back + Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M11.78 3.22a.75.75 0 010 1.06L5.81 10.25h12.44a.75.75 0 010 1.5H5.81l5.97 6a.75.75 0 11-1.06 1.06l-7.25-7.25a.75.75 0 010-1.06l7.25-7.25a.75.75 0 011.06 0z" clipRule="evenodd"/></svg>
              </button>
            <Link to="/" className="flex items-center" onClick={handleLogoClick}>
              <div className="relative p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-[1px] border-white/20 dark:border-gray-600/30 shadow-lg shadow-blue-500/10 dark:shadow-blue-400/20 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/30 transition-all duration-300">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent"></div>
                
                {/* Professional shine effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-400/10 dark:via-blue-500/15 to-transparent animate-pulse opacity-60"></div>
                
                <img 
                  src="/brands/300cc830-81cf-481c-875b-e875ad41abdb.png" 
                  alt="TopComputers Logo" 
                  className="relative z-10 h-[40px] sm:h-[42px] w-auto object-contain transition-transform duration-1000 ease-out rounded-lg"
                />
              </div>
            </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Cart Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
              >
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content with padding for fixed navbar and mobile bottom nav */}
      <div className="pt-20 pb-20 md:pb-0">
        <Outlet />
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 backdrop-blur-sm bg-black/10 z-50"
            />

            {/* Cart Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto">
                {cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start shopping to add items to your cart</p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item.productId} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {item.productTitle}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${item.price.toFixed(2)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-medium px-2 dark:text-gray-200">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="mt-1 p-1 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${cart.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      to="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                    >
                      View Cart & Checkout
                    </Link>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="inline-block relative p-4 rounded-xl bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm mb-4 border border-white/20 dark:border-gray-600/30 shadow-xl shadow-orange-500/10 dark:shadow-blue-400/20 hover:shadow-2xl hover:shadow-orange-500/15 dark:hover:shadow-blue-400/25 transition-all duration-500">
                {/* Professional inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-50/20 to-yellow-50/10 dark:from-blue-900/20 dark:to-cyan-900/15"></div>
                
                {/* Elegant shine sweep */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 dark:via-blue-300/10 to-transparent animate-pulse opacity-30"></div>
                
                {/* Subtle outer glow ring */}
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-500/25 dark:to-cyan-500/25 blur-sm opacity-40"></div>
                
                <img 
                  src="/brands/300cc830-81cf-481c-875b-e875ad41abdb.png" 
                  alt="TopComputers Logo" 
                  className="relative z-10 h-11 sm:h-12 w-auto object-contain transition-transform duration-1000 ease-out rounded-lg"
                />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your trusted partner for all technology needs. We provide high-quality computers, laptops, and electronics with exceptional customer service.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/catalog" className="text-gray-400 hover:text-white transition-colors duration-200">Catalog</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors duration-200">Categories</Link></li>
                <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors duration-200">Services</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 +1 (555) 123-4567</p>
                <p>📧 info@topcomputers.com</p>
                <p>📍 123 Tech Street, Digital City</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
