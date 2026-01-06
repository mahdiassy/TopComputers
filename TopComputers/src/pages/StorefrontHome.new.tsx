import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Laptop, 
  Smartphone, 
  Tv, 
  Headphones, 
  Camera,
  ShoppingCart,
  ArrowRight,
  Check
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import type { Product, Category } from '../types/catalog';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}

function HeroBanner({ title, subtitle, image, link }: HeroBannerProps) {
  return (
    <div className="relative h-96 bg-gradient-to-r from-blue-800 to-blue-600 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="relative h-full flex items-center justify-center text-center text-white px-4">
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-blue-100"
          >
            {subtitle}
          </motion.p>
          {link && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to={link}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    try {
      addToCart(product, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden group border border-gray-100 hover:border-blue-200 transition-all duration-300"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <img 
            src={product.thumbnail} 
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {product.stock > 0 ? (
            <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              In Stock
            </span>
          ) : (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {product.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.description || "High-quality product with excellent performance and reliability. Perfect for professionals and enthusiasts alike."}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              SKU: {product.sku}
            </span>
          </div>
          
          {product.stock > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isAdded}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isAdded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
                } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function StorefrontHome({ onSecretGesture }: { onSecretGesture: () => void }) {
  const { categories, products, loadingCategories, loadingProducts } = useCatalog();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get featured products (latest 8 products)
    const featured = products.slice(0, 8);
    setFeaturedProducts(featured);
  }, [products]);

  useEffect(() => {
    // Get featured categories (first 6 active categories)
    const featured = categories.filter(cat => cat.active).slice(0, 6);
    setFeaturedCategories(featured);
  }, [categories]);

  const categoryIcons = [
    Monitor, Laptop, Smartphone, Tv, Headphones, Camera
  ];

  const handleLogoClick = () => {
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

  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Secret Logo Click Area */}
      <div 
        className="fixed top-4 left-4 w-16 h-16 z-50 cursor-pointer opacity-0 hover:opacity-20"
        onClick={handleLogoClick}
      />
      
      {/* Hero Banner */}
      <HeroBanner
        title="Latest Technology"
        subtitle="Discover the best computers, laptops, and electronics at unbeatable prices"
        image="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200&h=400&fit=crop"
        link="/catalog"
      />

      {/* Featured Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-32 mb-4"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featuredCategories.map((category, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                return (
                  <motion.div
                    key={category.id}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/catalog?category=${category.slug}`} className="block">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 border border-blue-200 group-hover:border-blue-300">
                        <Icon className="h-12 w-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Latest arrivals and best sellers</p>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
                  <div className="bg-gray-200 rounded h-6 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-8 w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/catalog"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <img 
                src="/store-logo.jpg" 
                alt="TopComputers" 
                className="h-16 w-auto object-contain mb-4"
              />
              <p className="text-gray-400 mb-4 max-w-md">
                Your trusted partner for all technology needs. We provide high-quality computers, laptops, and electronics with exceptional customer service.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/catalog" className="text-gray-400 hover:text-white transition-colors duration-200">Catalog</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors duration-200">Categories</Link></li>
                <li><Link to="/brands" className="text-gray-400 hover:text-white transition-colors duration-200">Brands</Link></li>
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
            <p>&copy; 2024 TopComputers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
