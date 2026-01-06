import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Share2,
  Check,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ShoppingCart,
  Facebook,
  Instagram,
  Linkedin,
  Music,
  X
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import ProductImageGallery from '../components/ProductImageGallery';
import WhatsAppOrderForm from '../components/WhatsAppOrderForm';
import CartAnimation from '../components/CartAnimation';
// Local Product interface to avoid Vite module resolution issues
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



export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { getProductBySlug, categories, brands, siteSettings } = useCatalog();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [showCartFeedback, setShowCartFeedback] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareProduct = (platform: string) => {
    if (!product) return;
    
    const productUrl = window.location.href;
    const productTitle = product.title;
    const productPrice = `$${product.salePrice || product.price}`;
    const shareText = `Check out this amazing product: ${productTitle} - ${productPrice}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing, opens Instagram
      tiktok: `https://www.tiktok.com/`, // TikTok doesn't support direct sharing, opens TikTok
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
      copy: productUrl
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(productUrl);
      alert('Product link copied to clipboard!');
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    
    setShowShareModal(false);
  };

  // Add to cart functionality
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setShowCartAnimation(true);
    setShowCartFeedback(true);
    setIsButtonPressed(true);
    setTimeout(() => setIsButtonPressed(false), 150);
    setTimeout(() => setShowCartFeedback(false), 1200);
  };

  // Handle cart animation completion
  const handleCartAnimationComplete = () => {
    setShowCartAnimation(false);
  };

  // COST OPTIMIZATION: Simple WhatsApp order - no user accounts needed
  const handleOrderNow = () => {
    if (!product) return;
    setShowOrderForm(true);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      setLoading(true);
      const productData = await getProductBySlug(slug);
      setProduct(productData);
      setLoading(false);
    };

    fetchProduct();
  }, [slug, getProductBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
          <Link to="/catalog" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  const brand = brands.find(b => b.id === product.brandId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cart Animation */}
      <CartAnimation 
        isVisible={showCartAnimation} 
        onComplete={handleCartAnimationComplete} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Home</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Products</Link>
          {category && (
            <>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white">{category.name}</span>
            </>
          )}
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* COST OPTIMIZATION: Enhanced Image Gallery with swipe support */}
          <ProductImageGallery 
            images={product.images.length > 0 ? product.images : [product.thumbnail]} 
            productTitle={product.title}
            className="lg:sticky lg:top-8"
          />

          {/* Product Information */}
          <div className="space-y-6">
            {/* Brand */}
            {brand && (
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{brand.name}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.title}
            </h1>

            {/* Professional Description */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r-lg shadow-sm">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.description || `Professional-grade ${product.title.toLowerCase()} featuring advanced technology and superior build quality. Designed for reliability and optimal performance in demanding environments.`}
              </p>
            </div>

            {/* Product Highlights */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(product.specs).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{key}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                  ${product.price}
                </span>
              )}
              {product.salePrice && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                  Save ${(product.price - product.salePrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-semibold">Out of Stock</span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-gray-700 dark:text-gray-300 font-semibold">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-1000 ease-out font-semibold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(product.stock, value)));
                      }}
                      onFocus={(e) => e.target.select()}
                      className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold border-l border-r border-gray-300 dark:border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-1000 ease-out font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 action-buttons">
                  {/* Add to Cart Button */}
                  <button 
                    onClick={handleAddToCart}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-1000 ease-out flex items-center justify-center text-lg shadow-xl hover:shadow-2xl border-2 border-blue-500 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 ${isButtonPressed ? 'scale-95' : ''}`}
                  >
                    <ShoppingCart className="h-6 w-6 mr-3" />
                    Add to Cart ({quantity})
                  </button>
                  {showCartFeedback && (
                    <div className="mt-2 text-green-600 dark:text-green-400 font-semibold text-center animate-pulse transition-all duration-700">Added to cart!</div>
                  )}
                  
                  {/* Order Now Button */}
                  <button 
                    onClick={handleOrderNow}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-1000 ease-out flex items-center justify-center text-lg shadow-xl hover:shadow-2xl border-2 border-green-500 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500"
                  >
                    <MessageCircle className="h-6 w-6 mr-3" />
                    Order Now via WhatsApp
                  </button>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-1000 ease-out border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Product
                  </button>
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {siteSettings?.policies?.shipping?.freeShippingEnabled && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Free Shipping</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{siteSettings.policies.shipping.description}</p>
                    </div>
                  </div>
                )}
                {siteSettings?.policies?.warranty?.enabled && (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Warranty</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{siteSettings.policies.warranty.description}</p>
                    </div>
                  </div>
                )}
                {siteSettings?.features?.showReturnPolicy && siteSettings?.policies?.returnPolicy?.enabled && (
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <RotateCcw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Returns</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{siteSettings.policies.returnPolicy.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-2 font-medium text-sm border-b-2 ${
                    selectedTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none">
                {product.description ? (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description available for this product.
                  </p>
                )}
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!product.specs || Object.keys(product.specs).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No specifications available</p>
                ) : (
                  Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{key}:</span>
                        <span className="text-gray-700 dark:text-gray-300">{value}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Order Form Modal */}
        {showOrderForm && product && (
          <WhatsAppOrderForm 
            product={product}
            quantity={quantity}
            onClose={() => setShowOrderForm(false)}
          />
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <Share2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Product</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Share "{product?.title}" with your friends
                </p>
              </div>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => shareProduct('facebook')}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  Facebook
                </button>
                
                <button
                  onClick={() => shareProduct('whatsapp')}
                  className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </button>
                
                <button
                  onClick={() => shareProduct('instagram')}
                  className="flex items-center justify-center gap-2 p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  Instagram
                </button>
                
                <button
                  onClick={() => shareProduct('linkedin')}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                  LinkedIn
                </button>
                
                <button
                  onClick={() => shareProduct('tiktok')}
                  className="flex items-center justify-center gap-2 p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Music className="h-5 w-5" />
                  TikTok
                </button>
                
                <button
                  onClick={() => shareProduct('copy')}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Copy Link
                </button>
              </div>

              {/* Product Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                <img 
                  src={product?.thumbnail} 
                  alt={product?.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {product?.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${product?.salePrice || product?.price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
