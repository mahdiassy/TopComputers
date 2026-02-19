import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ShoppingCart,
  X,
  Package
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import CartAnimation from '../components/CartAnimation';
import type { Product, FilterState } from '../types/catalog';

interface ProductCardProps {
  product: Product;
  view: 'grid' | 'list';
}

function ProductCard({ product, view, onAddToCart }: ProductCardProps & { onAddToCart: (product: Product) => void }) {
  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price;
  const salePriceNum = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice as string) || 0 : product.salePrice) : 0;
  const discountPercentage = salePriceNum && priceNum > 0
    ? Math.round(((priceNum - salePriceNum) / priceNum) * 100)
    : 0;
  const [hasImage, setHasImage] = useState<boolean>(Boolean(product.thumbnail));
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  if (view === 'list') {
    return (
      <Link to={`/product/${product.slug}`}>
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-1000 ease-out flex items-center border border-gray-200 dark:border-gray-700 group"
      >
        <div className="relative w-24 h-24 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
          {hasImage ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              onError={() => setHasImage(false)}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-700">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-1">
                <Package className="w-3 h-3 text-gray-500 dark:text-gray-300" />
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-xs">No Image</span>
            </div>
          )}
            {product.salePrice && product.salePrice < product.price && (
              <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs bg-red-600 px-2 py-1 rounded-full">Out of Stock</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-1000 ease-out line-clamp-1">
              {product.title}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku}</span>
              {product.stock > 0 ? (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-1"></span>
                  Out of Stock
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {product.salePrice && product.salePrice < product.price ? (
                  <>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      {product.salePrice}$
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {product.price}$
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.salePrice || product.price}$
                  </span>
                )}
              </div>
              
              {product.stock > 0 && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsButtonPressed(true);
                    setTimeout(() => setIsButtonPressed(false), 150);
                    onAddToCart(product);
                  }}
                  className={`bg-blue-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-green-400 transition-all duration-1000 ease-out flex items-center space-x-2 shadow-lg dark:shadow-green-400 dark:shadow-2xl dark:shadow-green-500/80 dark:shadow-[0_0_20px_rgba(34,197,94,0.8)] dark:shadow-[0_0_40px_rgba(34,197,94,0.6)] dark:shadow-[0_0_60px_rgba(34,197,94,0.4)] ${isButtonPressed ? 'scale-95' : ''}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-1000 ease-out border border-gray-200 dark:border-gray-700 group"
      >
        {/* Grid view image container: fixed height and perfect centering */}
        <div className="relative bg-white dark:bg-gray-800 flex items-center justify-center h-40 sm:h-44 md:h-48 overflow-hidden">
          {hasImage ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              onError={() => setHasImage(false)}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-700">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2">
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              </div>
              <span className="text-gray-600 dark:text-gray-300 text-xs">No Image</span>
            </div>
          )}
          {product.salePrice && product.salePrice < product.price && (
            <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs bg-red-600 px-2 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-2 sm:p-3 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-1000 ease-out">
              {product.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {product.sku}
            </p>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                {product.salePrice && product.salePrice < product.price ? (
                  <>
                    <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
                      {product.salePrice}$
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                      {product.price}$
                    </span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {product.salePrice || product.price}$
                  </span>
                )}
              </div>
              
              {product.stock > 0 ? (
                <span className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-1"></span>
                  <span className="hidden sm:inline">In Stock</span>
                  <span className="sm:hidden">✓</span>
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full mr-1"></span>
                  <span className="hidden sm:inline">Out of Stock</span>
                  <span className="sm:hidden">✗</span>
                </span>
              )}
            </div>
          </div>
          
          {product.stock > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsButtonPressed(true);
                setTimeout(() => setIsButtonPressed(false), 150);
                onAddToCart(product);
              }}
              className={`bg-blue-600 dark:bg-green-500 text-white py-1 rounded text-xs font-medium hover:bg-blue-700 dark:hover:bg-green-400 transition-all duration-1000 ease-out flex items-center justify-center space-x-1 mt-auto shadow-lg dark:shadow-green-400 dark:shadow-2xl dark:shadow-green-500/80 dark:shadow-[0_0_20px_rgba(34,197,94,0.8)] dark:shadow-[0_0_40px_rgba(34,197,94,0.6)] dark:shadow-[0_0_60px_rgba(34,197,94,0.4)] ${isButtonPressed ? 'scale-95' : ''}`}
            >
              <ShoppingCart className="h-3 w-3" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

function Filters({ filters, onFiltersChange, isOpen, onClose }: FiltersProps) {
  const { categories, brands } = useCatalog();
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);
  const [isPriceRangeChanged, setIsPriceRangeChanged] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandToggle = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter(id => id !== brandId)
      : [...filters.brands, brandId];
    
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = () => {
    onFiltersChange({ ...filters, priceRange });
    setIsPriceRangeChanged(false);
  };

  const handlePriceInputChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
    setIsPriceRangeChanged(true);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      brands: [],
      priceRange: [0, 10000],
      availability: 'all',
      search: ''
    };
    onFiltersChange(clearedFilters);
    setPriceRange([0, 10000]);
    setIsPriceRangeChanged(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  const filterContent = (
    <div className="space-y-8">
      {/* Header with Active Filters Count */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-1000 ease-out border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>Categories</span>
        </h4>
        <div className="space-y-3">
          {categories.filter(cat => cat.active).map((category) => (
            <label key={category.id} className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-1000 ease-out ${
                  filters.categories.includes(category.id)
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400 dark:group-hover:border-blue-500'
                }`}>
                  {filters.categories.includes(category.id) && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-1000 ease-out">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span>Brands</span>
        </h4>
        <div className="space-y-3">
          {brands.filter(brand => brand.active).map((brand) => (
            <label key={brand.id} className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => handleBrandToggle(brand.id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-1000 ease-out ${
                  filters.brands.includes(brand.id)
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-green-400 dark:group-hover:border-green-500'
                }`}>
                  {filters.brands.includes(brand.id) && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-1000 ease-out">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <span>Price Range</span>
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange[0] || ''}
                onChange={(e) => handlePriceInputChange(0, Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-1000 ease-out shadow-sm hover:shadow-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange[1] || ''}
                onChange={(e) => handlePriceInputChange(1, Number(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-1000 ease-out shadow-sm hover:shadow-md"
              />
            </div>
          </div>
          <button
            onClick={handlePriceRangeChange}
            disabled={!isPriceRangeChanged}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-1000 ease-out ${
              isPriceRangeChanged
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl '
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPriceRangeChanged ? 'Apply Price Filter' : 'Price Filter Applied'}
          </button>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
          <span>Availability</span>
        </h4>
        <div className="space-y-3">
          {[
            { value: 'all', label: 'All Products', icon: Package },
            { value: 'in-stock', label: 'In Stock', icon: 'check' },
            { value: 'out-of-stock', label: 'Out of Stock', icon: 'x' }
          ].map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={(e) => onFiltersChange({ ...filters, availability: e.target.value as FilterState['availability'] })}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ease-out ${
                  filters.availability === option.value
                    ? 'bg-orange-600 dark:bg-orange-500 border-orange-600 dark:border-orange-500' 
                    : 'border-gray-400 dark:border-gray-400 bg-white dark:bg-gray-700 group-hover:border-orange-400 dark:group-hover:border-orange-500'
                }`}>
                  {filters.availability === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <span className="ml-3 text-gray-700 dark:text-gray-300 font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-1000 ease-out flex items-center space-x-2">
                {option.icon === Package ? (
                  <Package className="w-4 h-4" />
                ) : option.icon === 'check' ? (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-2 h-2 text-white" />
                  </div>
                )}
                <span>{option.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-fit sticky top-24 border border-gray-100 dark:border-gray-700">
        {filterContent}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose} />
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl p-8 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-1000 ease-out">
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
}

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const { products, categories, brands, loadingProducts } = useCatalog();
  const { addToCart } = useCart();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: [0, 10000],
    availability: 'all',
    search: ''
  });

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      brands: [],
      priceRange: [0, 10000],
      availability: 'all',
      search: ''
    };
    setFilters(clearedFilters);
  };

  // Handle cart animation
  const handleCartAnimationComplete = () => {
    setShowCartAnimation(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setShowCartAnimation(true);
  };

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    if (category) {
      const categoryObj = categories.find(cat => cat.slug === category);
      if (categoryObj) {
        setFilters(prev => ({ ...prev, categories: [categoryObj.id] }));
      }
    }

    if (brand) {
      const brandObj = brands.find(b => b.slug === brand);
      if (brandObj) {
        setFilters(prev => ({ ...prev, brands: [brandObj.id] }));
      }
    }

    if (search) {
      setFilters(prev => ({ ...prev, search }));
    }
  }, [searchParams, categories, brands]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.categoryId)
      );
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        product.brandId && filters.brands.includes(product.brandId)
      );
    }

    // Filter by price range - handle both string and number prices
    filtered = filtered.filter(product => {
      const priceValue = product.salePrice || product.price;
      const price = typeof priceValue === 'string' ? parseFloat(priceValue) || 0 : priceValue;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Filter by availability
    if (filters.availability === 'in-stock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (filters.availability === 'out-of-stock') {
      filtered = filtered.filter(product => product.stock === 0);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort products - handle both string and number prices
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = typeof (a.salePrice || a.price) === 'string' ? parseFloat(String(a.salePrice || a.price)) || 0 : Number(a.salePrice || a.price) || 0;
          const priceB = typeof (b.salePrice || b.price) === 'string' ? parseFloat(String(b.salePrice || b.price)) || 0 : Number(b.salePrice || b.price) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = typeof (a.salePrice || a.price) === 'string' ? parseFloat(String(a.salePrice || a.price)) || 0 : Number(a.salePrice || a.price) || 0;
          const priceB = typeof (b.salePrice || b.price) === 'string' ? parseFloat(String(b.salePrice || b.price)) || 0 : Number(b.salePrice || b.price) || 0;
          return priceB - priceA;
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [products, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cart Animation */}
      <CartAnimation 
        isVisible={showCartAnimation} 
        onComplete={handleCartAnimationComplete} 
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 shadow-xl">
        <div className="w-full px-1 sm:px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-lg sm:text-2xl font-bold mb-1.5 flex items-center space-x-1">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Product Catalog</span>
              </h1>
              <p className="text-blue-100 dark:text-gray-300 text-xs sm:text-sm">
                Discover {filteredProducts.length} amazing products
              </p>
            </div>
            
            {/* Search */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-200 dark:text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <input
                  type="text"
                  placeholder="Search products, brands, or categories..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8 pr-3 py-1.5 border border-white/30 dark:border-gray-600 rounded-xl bg-white/95 dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-xs text-xs sm:text-sm shadow-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-1000 ease-out"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="w-full px-1 sm:px-4 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <Filters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center px-2 py-1.5 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-1000 ease-out text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <span className="ml-1 sm:ml-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-2 py-1.5 sm:px-4 sm:py-3 pr-8 sm:pr-10 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-1000 ease-out text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-3 rounded-lg transition-all duration-1000 ease-out ${view === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-3 rounded-lg transition-all duration-1000 ease-out ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {loadingProducts ? (
              <div className={`grid gap-1 sm:gap-2 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100 dark:border-gray-700">
                    <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-1 sm:gap-2 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} view={view} onAddToCart={handleAddToCart} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  Try adjusting your filters or search terms to find what you're looking for
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-1000 ease-out font-semibold shadow-lg hover:shadow-xl  flex items-center space-x-2 mx-auto"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

