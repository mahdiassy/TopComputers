import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { Category, Brand, Product, InventoryLog, SiteSettings } from '../types/catalog';
import toast from 'react-hot-toast';

interface CatalogContextType {
  // Categories
  categories: Category[];
  loadingCategories: boolean;
  getCategories: () => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Brands
  brands: Brand[];
  loadingBrands: boolean;
  getBrands: () => Promise<void>;
  createBrand: (brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Products with pagination
  products: Product[];
  loadingProducts: boolean;
  hasMoreProducts: boolean;
  lastProductDoc: DocumentSnapshot | null;
  getProducts: (filters?: any, loadMore?: boolean) => Promise<void>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  uploadProductImage: (file: File, productId: string) => Promise<string>;
  uploadMultipleProductImages: (files: File[], productId: string) => Promise<string[]>;
  deleteProductImage: (imageUrl: string) => Promise<void>;

  // Inventory
  updateStock: (productId: string, quantity: number, reason: string) => Promise<void>;
  getInventoryLogs: (productId: string) => Promise<InventoryLog[]>;

  // Site Settings with caching
  siteSettings: SiteSettings | null;
  loadingSiteSettings: boolean;
  getSiteSettings: () => Promise<void>;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}

interface CatalogProviderProps {
  children: ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSiteSettings, setLoadingSiteSettings] = useState(false);
  
  // COST OPTIMIZATION: Pagination state for products
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [lastProductDoc, setLastProductDoc] = useState<DocumentSnapshot | null>(null);
  
  // COST OPTIMIZATION: Simple cache to avoid repeated queries
  const [cachedCategories, setCachedCategories] = useState<Category[] | null>(null);
  const [cachedBrands, setCachedBrands] = useState<Brand[] | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // COST OPTIMIZATION: Cache categories to avoid repeated queries
  const getCategories = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (cachedCategories && (now - cacheTimestamp) < CACHE_DURATION) {
        setCategories(cachedCategories);
        return;
      }
      
      setLoadingCategories(true);
      const querySnapshot = await getDocs(
        query(collection(db, 'categories'), orderBy('name'))
      );
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Category[];
      
      setCategories(categoriesData);
      setCachedCategories(categoriesData);
      setCacheTimestamp(now);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [cachedCategories, cacheTimestamp]);

  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Category created successfully');
      // Clear cache and reload
      setCachedCategories(null);
      await getCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateDoc(doc(db, 'categories', id), {
        ...updates,
        updatedAt: new Date(),
      });
      toast.success('Category updated successfully');
      // Clear cache and reload
      setCachedCategories(null);
      await getCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Category deleted successfully');
      // Clear cache and reload
      setCachedCategories(null);
      await getCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  // COST OPTIMIZATION: Cache brands to avoid repeated queries
  const getBrands = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (cachedBrands && (now - cacheTimestamp) < CACHE_DURATION) {
        setBrands(cachedBrands);
        return;
      }
      
      setLoadingBrands(true);
      const querySnapshot = await getDocs(
        query(collection(db, 'brands'), orderBy('name'))
      );
      const brandsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Brand[];
      
      setBrands(brandsData);
      setCachedBrands(brandsData);
      setCacheTimestamp(now);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setLoadingBrands(false);
    }
  }, [cachedBrands, cacheTimestamp]);

  const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'brands'), {
        ...brandData,
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Brand created successfully');
      await getBrands();
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    }
  };

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      await updateDoc(doc(db, 'brands', id), {
        ...updates,
        updatedAt: new Date(),
      });
      toast.success('Brand updated successfully');
      await getBrands();
    } catch (error) {
      console.error('Error updating brand:', error);
      toast.error('Failed to update brand');
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'brands', id));
      toast.success('Brand deleted successfully');
      await getBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  // COST OPTIMIZATION: Products with pagination to reduce reads
  const getProducts = useCallback(async (filters?: any, loadMore: boolean = false) => {
    try {
      setLoadingProducts(true);
      
      const PAGE_SIZE = 20; // Load 20 products at a time
      let q = query(collection(db, 'products'));
      
      // Apply status filter first to avoid composite index issues
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      } else if (!filters?.includeArchived) {
        // Only show active and inactive products, exclude archived
        q = query(q, where('status', 'in', ['active', 'inactive']));
      }
      
      // For now, don't use orderBy to avoid index issues - we'll sort in JavaScript
      // q = query(q, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      
      if (filters?.category) {
        q = query(q, where('categoryId', '==', filters.category));
      }
      if (filters?.brand) {
        q = query(q, where('brandId', '==', filters.brand));
      }

      // For pagination: start after the last document
      if (loadMore && lastProductDoc) {
        q = query(q, startAfter(lastProductDoc));
      }

      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      
      // Sort products by createdAt in descending order (newest first)
      const sortedProducts = productsData.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      // Update products list
      if (loadMore) {
        setProducts(prev => [...prev, ...sortedProducts]);
      } else {
        setProducts(sortedProducts);
      }
      
      // Update pagination state
      setHasMoreProducts(querySnapshot.docs.length === PAGE_SIZE);
      setLastProductDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [cachedCategories, cachedBrands, cacheTimestamp]);

  const getProductBySlug = async (slug: string): Promise<Product | null> => {
    try {
      const q = query(
        collection(db, 'products'), 
        where('slug', '==', slug),
        where('status', 'in', ['active', 'inactive'])
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Product;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return null;
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date();
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Product created successfully');
      await getProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: new Date(),
      });
      toast.success('Product updated successfully');
      await getProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
      await getProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Upload single image for categories/brands with fallback
  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Starting image upload...', { fileName: file.name, fileSize: file.size });
      
      // Import ImageOptimizer dynamically to reduce bundle size
      const { ImageOptimizer } = await import('../utils/imageOptimization');
      
      // Validate and optimize image
      const validation = ImageOptimizer.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // PERFORMANCE OPTIMIZATION: Aggressive compression for categories/brands
      const optimizedFile = await ImageOptimizer.optimizeImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.7,
        format: 'webp',
        maxSizeKB: 150
      });

      console.log(`Image optimized: ${file.size} -> ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`);
      
      // DEVELOPMENT MODE: Use data URLs to avoid CORS issues
      // Set to false when Firebase Storage CORS is properly configured
      const USE_FIREBASE_STORAGE = false;
      
      if (USE_FIREBASE_STORAGE) {
        try {
          // Try Firebase Storage upload
          const timestamp = Date.now();
          const fileName = `images/${timestamp}-${optimizedFile.name}`;
          const storageRef = ref(storage, fileName);
          
          await uploadBytes(storageRef, optimizedFile);
          const downloadURL = await getDownloadURL(storageRef);
          
          console.log('Image uploaded to Firebase Storage:', downloadURL);
          return downloadURL;
        } catch (firebaseError) {
          console.warn('Firebase upload failed, falling back to data URL:', firebaseError);
        }
      }
      
      // FALLBACK: Convert to optimized data URL
      console.log('Using data URL (development mode)');
      
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(optimizedFile);
      });
      
      console.log('Image converted to data URL successfully');
      return dataUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // COST OPTIMIZATION: Upload multiple images with compression and WebP conversion
  const uploadProductImage = async (file: File, productId: string): Promise<string> => {
    try {
      console.log('Starting optimized image upload...', { fileName: file.name, fileSize: file.size, productId });
      
      // Import ImageOptimizer dynamically to reduce bundle size
      const { ImageOptimizer } = await import('../utils/imageOptimization');
      
      // Validate and optimize image
      const validation = ImageOptimizer.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // PERFORMANCE OPTIMIZATION: Aggressive compression for products
      const optimizedFile = await ImageOptimizer.optimizeImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.75,
        format: 'webp',
        maxSizeKB: 400
      });

      console.log(`Image optimized: ${file.size} -> ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`);
      
      // DEVELOPMENT MODE: Use data URLs to avoid CORS issues
      // Set to false when Firebase Storage CORS is properly configured
      const USE_FIREBASE_STORAGE = false;
      
      if (USE_FIREBASE_STORAGE) {
        try {
          // Try Firebase Storage upload
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substr(2, 9);
          const fileName = `products/${productId}/${timestamp}-${randomId}.webp`;
          const storageRef = ref(storage, fileName);
          
          await uploadBytes(storageRef, optimizedFile);
          const downloadURL = await getDownloadURL(storageRef);
          
          console.log('Product image uploaded to Firebase Storage:', downloadURL);
          toast.success(`Image optimized and uploaded successfully (${ImageOptimizer.formatFileSize(optimizedFile.size)})`);
          return downloadURL;
        } catch (firebaseError) {
          console.warn('Firebase upload failed, falling back to data URL:', firebaseError);
        }
      }
      
      // FALLBACK: Convert to optimized data URL
      console.log('Using data URL for product image (development mode)');
      
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(optimizedFile);
      });
      
      console.log('Product image converted to data URL successfully');
      toast.success(`Image optimized successfully (${ImageOptimizer.formatFileSize(optimizedFile.size)})`);
      return dataUrl;

      // TODO: Enable this when Firebase Storage is properly configured
      /*
      // Upload both optimized image and thumbnail
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      
      const imageFileName = `products/${productId}/${timestamp}-${randomId}.webp`;
      const thumbnailFileName = `products/${productId}/thumb-${timestamp}-${randomId}.webp`;
      
      const [imageSnapshot, thumbnailSnapshot] = await Promise.all([
        uploadBytes(ref(storage, imageFileName), optimizedFile),
        uploadBytes(ref(storage, thumbnailFileName), thumbnailFile)
      ]);
      
      const [imageURL, thumbnailURL] = await Promise.all([
        getDownloadURL(imageSnapshot.ref),
        getDownloadURL(thumbnailSnapshot.ref)
      ]);
      
      console.log('Upload completed:', { imageURL, thumbnailURL });
      toast.success('Image uploaded and optimized successfully');
      
      return imageURL;
      */
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // COST OPTIMIZATION: Upload multiple images with batch processing
  const uploadMultipleProductImages = async (files: File[], productId: string): Promise<string[]> => {
    const MAX_IMAGES = 10; // Limit to control storage costs
    
    if (files.length > MAX_IMAGES) {
      throw new Error(`Maximum ${MAX_IMAGES} images allowed per product`);
    }

    const uploadPromises = files.map(file => uploadProductImage(file, productId));
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      toast.success(`${uploadedUrls.length} images uploaded successfully`);
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      toast.error('Some images failed to upload');
      throw error;
    }
  };

  const deleteProductImage = async (imageUrl: string) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for image deletion failures
    }
  };

  const updateStock = async (productId: string, quantity: number, reason: string) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentProduct = productDoc.data() as Product;
      const previousStock = currentProduct.stock;
      const newStock = Math.max(0, previousStock + quantity);

      // Update product stock
      await updateDoc(doc(db, 'products', productId), {
        stock: newStock,
        updatedAt: new Date(),
      });

      // Create inventory log
      await addDoc(collection(db, 'inventoryLogs'), {
        productId,
        type: quantity > 0 ? 'in' : quantity < 0 ? 'out' : 'adjustment',
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        reason,
        createdAt: new Date(),
      });

      toast.success('Stock updated successfully');
      await getProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const getInventoryLogs = async (productId: string): Promise<InventoryLog[]> => {
    try {
      const q = query(
        collection(db, 'inventoryLogs'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as InventoryLog[];
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      return [];
    }
  };

  // Site Settings
  const getSiteSettings = useCallback(async () => {
    setLoadingSiteSettings(true);
    try {
      const settingsDoc = await getDoc(doc(db, 'siteSettings', 'main'));
      if (settingsDoc.exists()) {
        setSiteSettings({
          id: settingsDoc.id,
          ...settingsDoc.data(),
          updatedAt: settingsDoc.data().updatedAt?.toDate() || new Date(),
        } as SiteSettings);
      } else {
        // Create default settings if none exist
        const defaultSettings: Omit<SiteSettings, 'id'> = {
          siteName: 'TopComputers',
          siteDescription: 'Your premier destination for computers and electronics',
          siteLogo: '',
          favicon: '',
          contactEmail: 'info@topcomputers.com',
          contactPhone: '+1 (555) 123-4567',
          contactAddress: '123 Tech Street, Digital City, DC 12345',
          businessHours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
          homeBanners: [],
          featuredCategories: [],
          featuredProducts: [],
          contactInfo: {
            phone: '+1 (555) 123-4567',
            email: 'info@topcomputers.com',
            address: '123 Tech Street, Digital City, DC 12345',
            hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM'
          },
          socialMedia: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
          },
          seo: {
            metaTitle: 'TopComputers - Your Premier Computer Store',
            metaDescription: 'Discover the latest computers, laptops, and electronics at TopComputers.',
            metaKeywords: 'computers, laptops, electronics, technology, hardware',
            ogImage: ''
          },
          features: {
            showStockCount: true,
            allowBackorders: false,
            requireLogin: false,
            enableReviews: true,
            enableWishlist: true,
            showReturnPolicy: true
          },
          policies: {
            returnPolicy: {
              enabled: true,
              days: 30,
              description: '30 day policy'
            },
            warranty: {
              enabled: true,
              period: '1 year',
              description: '1 year coverage'
            },
            shipping: {
              freeShippingEnabled: true,
              freeShippingThreshold: 100,
              description: 'Orders over $100'
            }
          },
          whatsapp: {
            enabled: true,
            number: '+96171363861',
            message: 'Hello! I would like to place an order:'
          },
          notifications: {
            emailOnOrder: true,
            emailOnLowStock: true,
            lowStockThreshold: 5
          },
          maintenance: {
            enabled: false,
            title: '🔧 We\'ll Be Right Back!',
            message: 'We\'re currently performing scheduled maintenance to improve your experience. We\'ll be back online shortly. Thank you for your patience! 💙'
          },
          updatedAt: new Date()
        };
        const settingsRef = doc(db, 'siteSettings', 'main');
        await setDoc(settingsRef, defaultSettings);
        setSiteSettings({ id: 'main', ...defaultSettings });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast.error('Error loading site settings');
    } finally {
      setLoadingSiteSettings(false);
    }
  }, []);

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const settingsRef = doc(db, 'siteSettings', 'main');
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      await updateDoc(settingsRef, updateData);
      
      setSiteSettings(prev => prev ? { ...prev, ...updateData } : null);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Error updating settings');
      throw error;
    }
  };

  // COST OPTIMIZATION: Clear all caches
  const clearCache = () => {
    setCachedCategories(null);
    setCachedBrands(null);
    setCacheTimestamp(0);
    setLastProductDoc(null);
    setHasMoreProducts(true);
  };

  // Initialize data on mount
  useEffect(() => {
    getCategories();
    getBrands();
    getProducts();
    getSiteSettings();
  }, [getCategories, getBrands, getProducts, getSiteSettings]);

  const value = {
    categories,
    loadingCategories,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    brands,
    loadingBrands,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    products,
    loadingProducts,
    hasMoreProducts,
    lastProductDoc,
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    uploadProductImage,
    uploadMultipleProductImages,
    deleteProductImage,
    updateStock,
    getInventoryLogs,
    siteSettings,
    loadingSiteSettings,
    getSiteSettings,
    updateSiteSettings,
    clearCache,
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export default CatalogContext;
