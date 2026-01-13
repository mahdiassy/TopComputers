import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Package,
  CreditCard
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import WhatsAppOrderForm from '../components/WhatsAppOrderForm';

export default function CartPage() {
  const { 
    cart,
    updateQuantity, 
    removeFromCart, 
    clearCart
  } = useCart();
  
  const [showOrderForm, setShowOrderForm] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link 
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-pink-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-orange-400 dark:hover:to-pink-500 transition-all duration-300 shadow-lg dark:shadow-orange-500/40"
            >
              <Package className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const shipping = cart.shippingFee;
  const total = cart.total;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
              {cart.items.length} items
            </span>
          </div>
          
          <button
            onClick={clearCart}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-blue-500/20 overflow-hidden border dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Cart Items</h2>
                
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.productTitle}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          ${item.price} each
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 font-bold"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 font-bold"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Total Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm mt-1 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-blue-500/20 p-6 sticky top-8 border dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Shipping</span>
                  <span className="font-bold text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-pink-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-orange-400 dark:hover:to-pink-500 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg dark:shadow-orange-500/40 hover:shadow-xl dark:hover:shadow-orange-400/50"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>
              
              <Link
                to="/catalog"
                className="w-full mt-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3 px-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg border-2 border-gray-300 dark:border-gray-500 select-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Package className="h-5 w-5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order via WhatsApp */}
      {showOrderForm && cart.items.length > 0 && (
        <WhatsAppOrderForm
          cartItems={cart.items}
          cartTotal={cart.total}
          cartSubtotal={cart.subtotal}
          cartShipping={cart.shippingFee}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}
