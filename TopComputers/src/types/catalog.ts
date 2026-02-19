export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string; // Added image field for category display
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product variant for sizes with different prices
export interface ProductVariant {
  id: string;
  name: string; // e.g., "35 cm", "38 cm", "Large"
  price: string; // Price as text
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  brandId?: string; // Optional - products can exist without a brand
  supplierId?: string; // Optional - products can exist without a supplier
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
  variants?: ProductVariant[]; // Optional size variants with prices
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryLog {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: Date;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  homeBanners: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    active: boolean;
  }[];
  featuredCategories: string[];
  featuredProducts: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
  };
  features: {
    showStockCount: boolean;
    allowBackorders: boolean;
    requireLogin: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    showReturnPolicy: boolean;
  };
  policies: {
    returnPolicy: {
      enabled: boolean;
      days: number;
      description: string;
    };
    warranty: {
      enabled: boolean;
      period: string;
      description: string;
    };
    shipping: {
      freeShippingEnabled: boolean;
      freeShippingThreshold: number;
      description: string;
    };
  };
  whatsapp: {
    enabled: boolean;
    number: string;
    message: string;
  };
  notifications: {
    emailOnOrder: boolean;
    emailOnLowStock: boolean;
    lowStockThreshold: number;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
  };
  updatedAt: Date;
}

export interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  availability: 'all' | 'in-stock' | 'out-of-stock';
  search: string;
}

// COST OPTIMIZATION: Order and payment types with minimal data structure
export type PaymentMethod = 'whish' | 'cash_on_delivery';

export interface OrderItem {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string; // Optional for guest orders
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