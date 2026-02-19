import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  collection,
  addDoc,
  query,
  where,
  
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

// COST OPTIMIZATION: Local interfaces to avoid import issues
// Product variant for sizes with different prices
interface ProductVariant {
  id: string;
  name: string;
  price: string;
}

// Defining Product locally to avoid Vite module resolution issues
interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  brandId?: string; // Optional - products can exist without a brand
  sku: string;
  price: string | number;
  salePrice?: string | number;
  currency: string;
  stock: number;
  status: 'active' | 'inactive' | 'archived';
  tags: string[];
  specs: Record<string, string>;
  images: string[];
  thumbnail: string;
  description?: string;
  variants?: ProductVariant[]; // Size variants with prices
  createdAt: Date;
  updatedAt: Date;
}
type PaymentMethod = 'whish' | 'cash_on_delivery';

interface OrderItem {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: string | number;
  priceText: string; // Store original price text
  selectedVariant?: ProductVariant; // Selected size variant
  totalPrice: number;
}

interface Cart {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  timestamp?: number; // Added for expiration tracking
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  whishDetails?: {
    transactionId?: string;
    paymentUrl?: string;
  };
  deliveryDetails?: {
    estimatedDate?: Date;
    trackingNumber?: string;
    actualDeliveryDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

import { UsageTracker } from '../utils/costMonitoring';
import toast from 'react-hot-toast';

interface CartContextType {
  // Cart state
  cart: Cart;
  isLoading: boolean;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  
  // Order actions
  createOrder: (customerInfo: CustomerInfo, paymentMethod: PaymentMethod) => Promise<string>;
  
  // Order history
  orders: Order[];
  getOrderHistory: () => Promise<void>;
  
  // Utility
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
  products?: Product[];
}

// COST OPTIMIZATION: Calculate shipping based on Lebanese rates
const calculateShipping = (subtotal: number, city: string): number => {
  // Free shipping for orders over $100 or within Beirut
  if (subtotal >= 100 || city.toLowerCase().includes('beirut')) {
    return 0;
  }
  
  // Standard shipping rates for Lebanon
  const shippingRates: Record<string, number> = {
    'beirut': 0,
    'mount lebanon': 5,
    'tripoli': 8,
    'saida': 8,
    'nabatieh': 10,
    'baalbek': 12,
    'akkar': 15,
    'hermel': 15,
  };
  
  const cityKey = city.toLowerCase();
  for (const [region, rate] of Object.entries(shippingRates)) {
    if (cityKey.includes(region)) {
      return rate;
    }
  }
  
  return 10; // Default shipping rate
};

export function CartProvider({ children, products: propProducts = [] }: CartProviderProps) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    timestamp: Date.now(),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false); // Track if cart has been loaded from localStorage
  
  const { currentUser } = useAuth();
  
  // Use products from props
  const products = propProducts;
  
  const tracker = UsageTracker.getInstance();

  // COST OPTIMIZATION: Load cart from localStorage on mount with expiration check
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const currentTime = Date.now();
        const cartTimestamp = parsedCart.timestamp || 0;
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        // Check if cart has expired (older than 30 minutes)
        if (currentTime - cartTimestamp < thirtyMinutes) {
          // Migrate old cart items to include priceText if missing
          const migratedItems = parsedCart.items.map((item: OrderItem) => ({
            ...item,
            priceText: item.priceText || String(item.price), // Add priceText if missing
          }));
          setCart({ ...parsedCart, items: migratedItems });
          console.info('Cart loaded from localStorage with', parsedCart.items.length, 'items');
        } else {
          // Cart expired, clear it
          localStorage.removeItem('cart');
          console.info('Cart expired and has been cleared');
        }
      } catch (error) {
        console.warn('Failed to load cart from localStorage:', error);
        localStorage.removeItem('cart'); // Clear corrupted data
      }
    }
    setIsCartLoaded(true); // Mark cart as loaded regardless of whether there was saved data
  }, []);

  // COST OPTIMIZATION: Save cart to localStorage with timestamp (avoid Firestore writes for cart state)
  useEffect(() => {
    // Only save to localStorage after initial load to prevent overwriting saved cart
    if (isCartLoaded) {
      const cartWithTimestamp = {
        ...cart,
        timestamp: Date.now()
      };
      localStorage.setItem('cart', JSON.stringify(cartWithTimestamp));
      console.info('Cart saved to localStorage with', cart.items.length, 'items');
    }
  }, [cart, isCartLoaded]);

  // COST OPTIMIZATION: Load order history only for authenticated users with pagination
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    
    const ordersRef = collection(db, 'orders');
    // Avoid composite index requirement by removing orderBy and sorting client-side
    const q = query(
      ordersRef,
      where('customerId', '==', currentUser.uid),
      limit(50) // fetch a reasonable page and sort locally
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          deliveryDetails: {
            ...data.deliveryDetails,
            estimatedDate: data.deliveryDetails?.estimatedDate?.toDate(),
            actualDeliveryDate: data.deliveryDetails?.actualDeliveryDate?.toDate(),
          },
        } as Order);
      });
      
      // Sort by createdAt desc client-side
      ordersData.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      setOrders(ordersData);
      tracker.trackFirestoreRead(querySnapshot.docs.length);
    });
    
    return unsubscribe;
  }, [currentUser, tracker]);

  // PERFORMANCE OPTIMIZATION: Memoized cart calculations
  const recalculateCart = React.useCallback((items: OrderItem[], shippingCity?: string) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingFee = shippingCity ? calculateShipping(subtotal, shippingCity) : 0;
    const total = subtotal + shippingFee;
    
    return { subtotal, shippingFee, total, timestamp: Date.now() };
  }, []);

  const addToCart = React.useCallback((product: Product, quantity: number = 1, variant?: ProductVariant) => {
    if (quantity <= 0) return;
    
    setCart(prevCart => {
      // For products with variants, use variant ID to differentiate; otherwise use product ID
      const cartItemId = variant ? `${product.id}_${variant.id}` : product.id;
      const existingItemIndex = prevCart.items.findIndex(item => {
        if (variant) {
          return item.productId === product.id && item.selectedVariant?.id === variant.id;
        }
        return item.productId === product.id && !item.selectedVariant;
      });
      
      let newItems: OrderItem[];
      
      // Get price from variant or product
      const priceValue = variant ? variant.price : (product.salePrice || product.price);
      const priceNum = typeof priceValue === 'string' ? parseFloat(priceValue) || 0 : priceValue;
      const priceText = String(priceValue);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = [...prevCart.items];
        const existingItem = newItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock availability
        if (newQuantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: newQuantity * priceNum,
        };
      } else {
        // Add new item
        if (quantity > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`);
          return prevCart;
        }
        
        const newItem: OrderItem = {
          productId: product.id,
          productSlug: product.slug,
          productTitle: product.title,
          productImage: product.thumbnail || product.images[0] || '',
          quantity,
          price: priceNum,
          priceText, // Store original price as text
          selectedVariant: variant, // Store selected variant
          totalPrice: priceNum * quantity,
        };
        newItems = [...prevCart.items, newItem];
      }
      
      const calculations = recalculateCart(newItems);
      
      return {
        items: newItems,
        ...calculations,
      };
    });
  }, [recalculateCart]);

  const removeFromCart = React.useCallback((productId: string, variantId?: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => {
        if (variantId) {
          return !(item.productId === productId && item.selectedVariant?.id === variantId);
        }
        return !(item.productId === productId && !item.selectedVariant);
      });
      const calculations = recalculateCart(newItems);
      
      return {
        items: newItems,
        ...calculations,
      };
    });
  }, [recalculateCart]);

  const updateQuantity = React.useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    
    // Find product to check stock
    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }
    
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        const isMatch = variantId 
          ? (item.productId === productId && item.selectedVariant?.id === variantId)
          : (item.productId === productId && !item.selectedVariant);
        
        if (isMatch) {
          const priceNum = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
          return { ...item, quantity, totalPrice: quantity * priceNum };
        }
        return item;
      });
      
      const calculations = recalculateCart(newItems);
      
      return {
        items: newItems,
        ...calculations,
      };
    });
  }, [products, recalculateCart, removeFromCart]);

  const clearCart = React.useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      shippingFee: 0,
      total: 0,
      timestamp: Date.now(),
    });
  }, []);

  const createOrder = React.useCallback(async (
    customerInfo: CustomerInfo, 
    paymentMethod: PaymentMethod
  ): Promise<string> => {
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    setIsLoading(true);
    
    try {
      // Recalculate with shipping for the customer's city
      const finalCalculations = recalculateCart(cart.items, customerInfo.city);
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Estimate delivery date (3-7 business days for Lebanon)
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + (paymentMethod === 'whish' ? 3 : 5));
      
      const orderData: Omit<Order, 'id'> = {
        orderNumber,
        customerId: currentUser?.uid,
        customerInfo,
        items: cart.items,
        subtotal: finalCalculations.subtotal,
        shippingFee: finalCalculations.shippingFee,
        total: finalCalculations.total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        orderStatus: 'pending',
        whishDetails: paymentMethod === 'whish' ? {} : undefined,
        deliveryDetails: {
          estimatedDate,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // COST OPTIMIZATION: Single write operation to Firestore
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deliveryDetails: {
          ...orderData.deliveryDetails,
          estimatedDate: Timestamp.fromDate(estimatedDate),
        },
      });
      
      tracker.trackFirestoreWrite();
      
      // Clear cart after successful order
      clearCart();
      
      toast.success(`Order ${orderNumber} created successfully!`);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart, currentUser, recalculateCart, clearCart, tracker]);

  const getOrderHistory = React.useCallback(async () => {
    // Orders are automatically loaded via real-time listener
    // This function exists for manual refresh if needed
    if (!currentUser) return;
    
    // Real-time listener already handles this efficiently
    // No additional queries needed
  }, [currentUser]);

  const getCartItemCount = React.useCallback(() => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }, [cart.items]);

  const getCartTotal = React.useCallback(() => {
    return cart.total;
  }, [cart.total]);

  const value: CartContextType = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createOrder,
    orders,
    getOrderHistory,
    getCartItemCount,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
