import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Archive, 
  Package,  
  RotateCcw, 
  Search, 
  Grid3X3,
  List,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useActivity } from '../contexts/ActivityContext';

const AdminArchive: React.FC = () => {
  const { products, categories, brands, updateProduct, deleteProduct, getProducts } = useCatalog();
  const { addActivity } = useActivity();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // no longer used for gating view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [, setShowBulkActions] = useState(false);

  // Load archived-only for this page
  useEffect(() => {
    getProducts({ includeArchived: true });
  }, [getProducts]);

  // Get archived products
  const archivedProducts = useMemo(() => {
    return products.filter(product => product.status === 'archived');
  }, [products]);

  // Get categories that have archived products

  // Filter products by search only (show all archived by default)
  const filteredProducts = useMemo(() => {
    let filtered = archivedProducts;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [archivedProducts, searchTerm]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getBrandName = (brandId?: string) => {
    if (!brandId) return 'No Brand';
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'Unknown Brand';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-500', text: 'Out of Stock' };
    if (stock < 10) return { color: 'text-yellow-500', text: 'Low Stock' };
    return { color: 'text-green-500', text: 'In Stock' };
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleUnarchiveProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        await updateProduct(productId, { ...product, status: 'active' });
        addActivity({
          type: 'product',
          action: 'status_changed',
          title: product.title,
          description: `Unarchived product: ${product.title}`
        });
        setSelectedProducts(prev => prev.filter(id => id !== productId));
        // Reload archived list
        getProducts({ includeArchived: true });
      }
    } catch (error) {
      console.error('Error unarchiving product:', error);
    }
  };

  const handleBulkUnarchive = async () => {
    try {
      for (const productId of selectedProducts) {
        const product = products.find(p => p.id === productId);
        if (product) {
          await updateProduct(productId, { ...product, status: 'active' });
        }
      }
      // Reload archived list
      getProducts({ includeArchived: true });
      addActivity({
        type: 'product',
        action: 'updated',
        title: `${selectedProducts.length} products`,
        description: `Bulk unarchived ${selectedProducts.length} products`
      });
      setSelectedProducts([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk unarchiving products:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        const product = products.find(p => p.id === productId);
        if (product) {
          await deleteProduct(productId);
          addActivity({
            type: 'product',
            action: 'deleted',
            title: product.title,
            description: `Permanently deleted archived product: ${product.title}`
          });
          setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${selectedProducts.length} products?`)) {
      try {
        for (const productId of selectedProducts) {
          await deleteProduct(productId);
        }
        addActivity({
          type: 'product',
          action: 'deleted',
          title: `${selectedProducts.length} products`,
          description: `Bulk deleted ${selectedProducts.length} archived products`
        });
        setSelectedProducts([]);
        setShowBulkActions(false);
      } catch (error) {
        console.error('Error bulk deleting products:', error);
      }
    }
  };

  if (archivedProducts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Archive className="h-6 w-6 mr-3 text-orange-600" />
              Archive
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage archived products
            </p>
          </div>
        </div>

        <div className="text-center py-16">
          <Archive className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No archived products
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Products that are archived will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Archive className="h-6 w-6 mr-3 text-orange-600" />
            Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {archivedProducts.length} archived products
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {view === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Direct Archived Products List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Archived Products
        </h2>
      </div>

      {/* Archived Products Grid/List (always visible) */}
      {true && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ← Back to Categories
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getCategoryName(selectedCategory ?? '')} - {filteredProducts.length} archived products
              </h2>
            </div>
            {filteredProducts.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {selectedProducts.length === filteredProducts.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>Select All</span>
                </button>
                {selectedProducts.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkUnarchive}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Unarchive ({selectedProducts.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete ({selectedProducts.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-4 ${
              view === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 ${
                    view === 'list' ? 'flex items-center p-4' : 'p-4'
                  }`}
                >
                  {view === 'grid' ? (
                    // Grid View
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUnarchiveProduct(product.id)}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Unarchive"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          SKU: {product.sku}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            ${product.salePrice || product.price}
                          </span>
                          <span className={`text-xs font-medium ${getStockStatus(product.stock).color}`}>
                            {getStockStatus(product.stock).text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{getBrandName(product.brandId)}</span>
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs">
                            Archived
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            SKU: {product.sku} • {getBrandName(product.brandId)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              ${product.salePrice || product.price}
                            </span>
                            <span className={`text-xs font-medium ${getStockStatus(product.stock).color}`}>
                              {getStockStatus(product.stock).text}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs">
                              Archived
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUnarchiveProduct(product.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Unarchive"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No archived products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'This category has no archived products'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminArchive;
