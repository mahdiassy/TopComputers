import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  User, 
  Phone, 
  MapPin, 
  Truck,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
// Local interfaces to avoid import issues
// Defining Product locally to avoid Vite module resolution issues
interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  brandId?: string; // Optional - products can exist without a brand
  sku: string;
  price: number;
  salePrice?: number;
  currency: string;
  stock: number;
  status: 'active' | 'inactive' | 'archived';
  tags: string[];
  specs: Record<string, string>;
  images: string[];
  thumbnail: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
interface CustomerDetails {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
}

interface SavedDetails extends CustomerDetails {
  lastUsed: number;
}

import toast from 'react-hot-toast';

// OrderItem interface for cart items
interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface WhatsAppOrderFormProps {
  product?: Product; // Optional for single product orders
  quantity?: number; // Optional for single product orders
  cartItems?: OrderItem[]; // Optional for cart orders
  cartTotal?: number; // Optional for cart orders
  cartSubtotal?: number; // Optional for cart orders
  cartShipping?: number; // Optional for cart orders
  onClose?: () => void;
}

export default function WhatsAppOrderForm({ 
  product, 
  quantity, 
  cartItems, 
  cartTotal, 
  cartSubtotal, 
  cartShipping, 
  onClose 
}: WhatsAppOrderFormProps) {
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'whish' | 'cash_on_delivery'>('whish');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COST OPTIMIZATION: Lebanese cities for quick selection
  const lebaneseCities = [
    'Beirut', 'Tripoli', 'Saida', 'Tyre', 'Nabatieh', 'Baalbek', 
    'Zahle', 'Jounieh', 'Byblos', 'Antelias', 'Kaslik', 'Harissa'
  ];

  // PERFORMANCE OPTIMIZATION: Load saved customer details on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customerDetails');
      if (saved) {
        const savedDetails: SavedDetails = JSON.parse(saved);
        // Only auto-fill if details were used within last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (savedDetails.lastUsed > thirtyDaysAgo) {
          setCustomerDetails({
            fullName: savedDetails.fullName,
            phoneNumber: savedDetails.phoneNumber,
            address: savedDetails.address,
            city: savedDetails.city,
          });
          const toastId = 'customer-details-loaded';
          try { (toast as any).dismiss?.(toastId); } catch {}
          toast.success('Previous details loaded!', { id: toastId, duration: 2000 });
        }
      }
    } catch (error) {
      console.warn('Could not load saved details:', error);
    }
  }, []);

  // COST OPTIMIZATION: Save details to localStorage for future use
  const saveCustomerDetails = () => {
    try {
      const detailsToSave: SavedDetails = {
        ...customerDetails,
        lastUsed: Date.now(),
      };
      localStorage.setItem('customerDetails', JSON.stringify(detailsToSave));
    } catch (error) {
      console.warn('Could not save details:', error);
    }
  };

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!customerDetails.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!customerDetails.phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!/^(\+961|961|0)?[3-9]\d{7}$/.test(customerDetails.phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Lebanese phone number');
      return false;
    }
    if (!customerDetails.address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!customerDetails.city.trim()) {
      toast.error('Please select your city');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save details for future use
      saveCustomerDetails();
      
      // Calculate total price
      let totalPrice: number;
      let orderDetails: string;

      if (cartItems && cartItems.length > 0) {
        // Cart order with multiple products
        totalPrice = cartTotal || 0;
        
        const productsList = cartItems.map(item => 
          `📱 ${item.productTitle}\n   $${item.price.toFixed(2)} × ${item.quantity} = $${item.totalPrice.toFixed(2)}\n   🔗 Link: ${window.location.origin}/product/${item.productId}`
        ).join('\n\n');

        orderDetails = `
🛒 *New Cart Order*

📦 *Products (${cartItems.length} items):*

${productsList}

💰 *Order Summary:*
• Subtotal: $${cartSubtotal?.toFixed(2) || '0.00'}
• Shipping: To be confirmed by our team
• *Estimated Total (excl. delivery): $${(cartSubtotal || 0).toFixed(2)}*

👤 *Customer Details:*
• Name: ${customerDetails.fullName}
• Phone: ${customerDetails.phoneNumber}
• Address: ${customerDetails.address}
• City: ${customerDetails.city}

💸 *Payment Method:* ${paymentMethod === 'whish' ? '💳 Whish Payment' : '💵 Cash on Delivery'}
${promoCode ? `🎟️ *Promo Code:* ${promoCode}` : ''}

_Order placed via TopComputers website_
        `.trim();
      } else if (product && quantity) {
        // Single product order
        totalPrice = (product.salePrice || product.price) * quantity;
        
        orderDetails = `
🛒 *New Order Request*

📱 *Product:* ${product.title}
💰 *Price:* $${product.salePrice || product.price} each
📦 *Quantity:* ${quantity}
💳 *Estimated Total (excl. delivery):* $${totalPrice.toFixed(2)}

👤 *Customer Details:*
• Name: ${customerDetails.fullName}
• Phone: ${customerDetails.phoneNumber}
• Address: ${customerDetails.address}
• City: ${customerDetails.city}

💸 *Payment Method:* ${paymentMethod === 'whish' ? '💳 Whish Payment' : '💵 Cash on Delivery'}
${promoCode ? `🎟️ *Promo Code:* ${promoCode}` : ''}

🔗 *Product Link:* ${window.location.origin}/product/${product.slug}

_Order placed via TopComputers website_
        `.trim();
      } else {
        toast.error('No products to order');
        setIsSubmitting(false);
        return;
      }

      // Get WhatsApp number - Lebanese business number
      const whatsappNumber = '+96171363816'; // Your business WhatsApp number
      
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(orderDetails)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Clear cart if this was a cart order
      if (cartItems && cartItems.length > 0) {
        clearCart();
      }
      
      const toastId = 'wa-order-sent';
      try { (toast as any).dismiss?.(toastId); } catch {}
      toast.success('Order sent to WhatsApp!', { id: toastId, duration: 2000 });
      
      // Close the form after successful submission
      setTimeout(() => {
        onClose?.();
      }, 1000);
      
    } catch (error) {
      console.error('Error sending order:', error);
      toast.error('Failed to send order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Complete Your Order
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            {cartItems && cartItems.length > 0 ? (
              // Cart order summary
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Cart Order ({cartItems.length} items)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-3 py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.productTitle}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ${item.price.toFixed(2)} × {item.quantity} = ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 space-y-1">
                  {cartSubtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                    </div>
                  )}
                  {cartShipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                      <span className="text-gray-900 dark:text-white">${cartShipping.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>${cartTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            ) : product && quantity ? (
              // Single product summary
              <div className="flex gap-3">
                <img
                  src={product.thumbnail || product.images[0]}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${product.salePrice || product.price} × {quantity}
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Total: ${((product.salePrice || product.price) * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No products selected
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    value="whish"
                    checked={paymentMethod === 'whish'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'whish' | 'cash_on_delivery')}
                    className="text-blue-600"
                  />
                  {/* Whish Money Logo - Original Image */}
                  <div className="mx-3 flex items-center justify-center">
                    <img 
                      src="/dist/assets/image.png" 
                      alt="whish MONEY logo" 
                      className="w-12 h-12 rounded-lg shadow-sm object-contain"
                      onError={(e) => {
                        console.log('Image failed to load, check path:', e.currentTarget.src);
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">Pay with whish MONEY</span>
                    <p className="text-xs text-gray-500">Secure instant payment</p>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'whish' | 'cash_on_delivery')}
                    className="text-blue-600"
                  />
                  <Truck className="w-5 h-5 text-green-600 mx-3" />
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium">Cash on Delivery</span>
                    <p className="text-xs text-gray-500">Pay when you receive</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Your Details</h3>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerDetails.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerDetails.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="+961 70 123 456"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  Street Address *
                </label>
                <input
                  type="text"
                  value={customerDetails.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Building, Street, Area"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="w-4 h-4" />
                  City *
                </label>
                <select
                  value={customerDetails.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select your city</option>
                  {lebaneseCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Promo Code Section */}
            <div>
              <button
                type="button"
                onClick={() => setShowPromoCode(!showPromoCode)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2"
              >
                <Tag className="w-4 h-4" />
                Have a promo code?
                {showPromoCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showPromoCode && (
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter promo code (optional)"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Send Order via WhatsApp
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Your details will be saved for faster checkout next time
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
