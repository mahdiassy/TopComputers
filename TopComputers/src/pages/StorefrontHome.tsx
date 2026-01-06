import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart,
  ArrowRight,
  Folder
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import type { Product, Category } from '../types/catalog';


type Slide = {
  title: string;
  subtitle: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
};

function Carousel({ slides, autoPlayMs = 5000 }: { slides: Slide[]; autoPlayMs?: number }) {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimer();
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoPlayMs);
    return () => resetTimer();
  }, [current, slides.length, autoPlayMs]);

  return (
    <div className="relative h-[18rem] sm:h-[24rem] md:h-[30rem] overflow-hidden bg-gray-900">
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((s, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: index === current ? 1 : 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 ${index === current ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${s.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
            <div className="relative h-full flex items-center justify-center text-center text-white px-4 sm:px-6 py-4">
              <div className="max-w-5xl w-full space-y-3 sm:space-y-6">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: index === current ? 0 : 20, opacity: index === current ? 1 : 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl sm:text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow leading-tight"
                >
                  {s.title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: index === current ? 0 : 20, opacity: index === current ? 1 : 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-xs sm:text-lg md:text-2xl text-blue-100 leading-snug sm:leading-normal px-2"
                >
                  {s.subtitle}
                </motion.p>
                {s.ctaLink && s.ctaText && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: index === current ? 0 : 20, opacity: index === current ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                  >
                    <Link
                      to={s.ctaLink}
                      className="inline-flex items-center px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg sm:rounded-2xl font-semibold text-xs sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-blue-300/40 border border-blue-300"
                    >
                      {s.ctaText}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:ml-2 sm:h-5 sm:w-5" />
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile actions under carousel */}
      <div className="sm:hidden px-4 py-4 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3">
          <Link
            to="/catalog"
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-blue-300"
          >
            Explore Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="/services"
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-green-300"
          >
            View Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Glamorous edges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Controls */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all ${
              current === idx ? 'w-5 sm:w-6 md:w-8 bg-white' : 'w-1.5 sm:w-2 md:w-3 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur border border-white/20"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur border border-white/20"
      >
        ›
      </button>
    </div>
  );
}

// Special Featured Product Card for Homepage
function FeaturedProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [hasImage, setHasImage] = useState(true);

  const discountPercentage = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.slug}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-1000 ease-out border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-600 dark:shadow-blue-500/30 dark:shadow-2xl dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
        <div className="relative bg-white dark:bg-gray-700 flex items-center justify-center h-56 sm:h-64 overflow-hidden rounded-xl">
          {hasImage ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              onError={() => setHasImage(false)}
              className="w-full h-full object-cover rounded-xl transition-transform duration-1000 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 group-hover:bg-gray-50 dark:group-hover:bg-gray-600 transition-all duration-1000 ease-out">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 transition-transform duration-1000 ease-out">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-lg font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-1000 ease-out">No Image</span>
            </div>
          )}
          {product.salePrice && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              -{discountPercentage}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-1000 ease-out">
            {product.title}
          </h3>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-3 py-1 rounded-full text-xs font-medium">SKU: {product.sku}</span>
              {product.stock > 0 ? (
                <span className="text-green-600 dark:text-green-400 font-semibold bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 px-3 py-1 rounded-full text-xs">
                  ✓ In Stock
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-semibold bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 px-3 py-1 rounded-full text-xs">
                  ✗ Out of Stock
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {product.salePrice ? (
                <>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${product.salePrice}
                  </span>
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${product.price}
                </span>
              )}
            </div>
            
            {product.stock > 0 && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-green-500 dark:to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-green-400 dark:hover:to-green-500 transition-all duration-1000 ease-out text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 group-hover:shadow-2xl dark:shadow-green-400 dark:shadow-2xl dark:shadow-green-500/80 dark:shadow-[0_0_20px_rgba(34,197,94,0.8)] dark:shadow-[0_0_40px_rgba(34,197,94,0.6)] dark:shadow-[0_0_60px_rgba(34,197,94,0.4)]"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function StorefrontHome() {
  const { categories, products, loadingCategories, loadingProducts } = useCatalog();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Get featured products (latest 6 products)
    const featured = products.slice(0, 6);
    setFeaturedProducts(featured);
  }, [products]);

  useEffect(() => {
    // Get featured categories (first 6 active categories)
    const featured = categories.filter(cat => cat.active).slice(0, 6);
    setFeaturedCategories(featured);
  }, [categories]);


  const slides: Slide[] = [
    {
      title: 'World‑Class Tech, Crafted for You',
      subtitle: 'Premium computers, pro laptops, and cutting‑edge electronics — serviced by experts.',
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2942&auto=format&fit=crop',
      ctaText: 'Explore Catalog',
      ctaLink: '/catalog'
    },
    {
      title: 'Repairs. Upgrades. Custom Builds.',
      subtitle: 'From diagnostics to performance tuning — fast turnaround, quality guaranteed.',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'View Services',
      ctaLink: '/services'
    },
    {
      title: 'Design that Impresses',
      subtitle: 'Workstations and accessories that look as good as they perform.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'Contact Us',
      ctaLink: '/contact'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      
      {/* Glamorous Hero Carousel */}
      <Carousel slides={slides} autoPlayMs={6000} />

      {/* Featured Products */}
      <section className="py-12 sm:py-20 pb-16 sm:pb-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-1 sm:px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center space-x-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
              </div>
              <span>Featured Products</span>
            </h2>
            <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-300">Latest arrivals and best sellers</p>
          </div>

          {loadingProducts ? (
            <div className="w-full min-h-[40vh] flex items-center justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center w-full max-w-6xl">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse w-full max-w-[280px] sm:max-w-[320px]">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 sm:h-72 mb-4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full max-w-[280px] sm:max-w-[320px] group"
                  >
                    <FeaturedProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-20 sm:mt-24 mb-8">
            <Link 
              to="/catalog"
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl text-lg"
            >
              View All Products
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-1 sm:px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center space-x-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Folder className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span>Shop by Category</span>
            </h2>
            <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-400">Find exactly what you're looking for</p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-32 mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded h-3 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full min-h-[40vh] flex items-center justify-center">
              <div className="flex flex-wrap justify-center items-center gap-6 max-w-6xl">
                {featuredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/catalog?category=${category.slug}`} className="block">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 ease-out text-center group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600 w-56 h-56 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-600 group-hover:-translate-y-3 group-hover:scale-[1.02] dark:shadow-blue-500/30 dark:shadow-2xl dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] dark:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                        <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-700 ease-out group-hover:scale-[1.02]">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover rounded-3xl group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                          ) : (
                            <Folder className="w-12 h-12 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-700 ease-out" />
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-700 ease-out text-lg">
                          {category.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
