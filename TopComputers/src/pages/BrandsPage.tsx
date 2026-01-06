import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import OptimizedImage from '../components/OptimizedImage';
import type { Brand } from '../types/catalog';

export default function BrandsPage() {
  const { brands, products, loadingBrands } = useCatalog();
  const [activeBrands, setActiveBrands] = useState<Brand[]>([]);

  useEffect(() => {
    // Filter only active brands
    const active = brands.filter(brand => brand.active);
    setActiveBrands(active);
  }, [brands]);

  const getProductCountForBrand = (brandId: string) => {
    return products.filter(product => product.brandId === brandId && product.status === 'active').length;
  };

  if (loadingBrands) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-1 sm:px-4 lg:px-8 py-8">
          <div className="text-center">Loading brands...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-1 sm:px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center space-x-1">
            <Tag className="w-6 h-6 sm:w-10 sm:h-10" />
            <span>Our Brands</span>
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover products from the world's leading technology brands
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Home</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">Brands</span>
        </nav>

        {/* Brands Grid */}
        {activeBrands.length > 0 ? (
          <div className="w-full min-h-[50vh] flex items-center justify-center pb-32">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 max-w-6xl">
            {activeBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
              >
                <Link
                  to={`/catalog?brand=${brand.slug}`}
                  className="block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center group-hover:bg-blue-50 dark:group-hover:bg-gray-700 w-full aspect-square flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 group dark:shadow-green-500/30 dark:shadow-2xl dark:shadow-[0_0_20px_rgba(34,197,94,0.4)] dark:shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                    <div className="w-16 h-16 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-cover rounded-2xl sm:rounded-3xl transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${brand.logo ? 'hidden' : 'flex'}`}>
                        <Tag className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-sm sm:text-lg mb-1 sm:mb-2">
                      {brand.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium">
                      {getProductCountForBrand(brand.id)} products
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Brands Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Brands will appear here once they are added by the administrator.
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
