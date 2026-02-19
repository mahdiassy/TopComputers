import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  Archive,
  RotateCcw
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import { useSuppliers } from '../contexts/SuppliersContext';
import { useActivity } from '../contexts/ActivityContext';
import MediaSelector from '../components/MediaSelector';
import type { Product } from '../types/catalog';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  siteSettings: any;
}

function ProductTable({ products, onEdit, onDelete, onViewDetails, onArchive, onUnarchive, siteSettings }: ProductTableProps) {
  const { categories, brands } = useCatalog();
  const { suppliers } = useSuppliers();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getBrandName = (brandId?: string) => {
    if (!brandId) return 'No Brand';
    const brand = brands.find(br => br.id === brandId);
    return brand?.name || 'Unknown';
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'No Supplier';
    const supplier = suppliers.find(sup => sup.id === supplierId);
    return supplier?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStockStatus = (stock: number) => {
    const lowStockThreshold = siteSettings?.notifications?.lowStockThreshold || 5;
    if (stock === 0) return { icon: AlertCircle, color: 'text-red-500', text: 'Out of Stock' };
    if (stock < lowStockThreshold) return { icon: AlertCircle, color: 'text-yellow-500', text: 'Low Stock' };
    return { icon: CheckCircle, color: 'text-green-500', text: 'In Stock' };
  };

  // Format price - handle both string and number
  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') {
      return price;
    }
    return price.toString();
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Mobile Card View - only on small screens */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const StockIcon = stockStatus.icon;
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden shadow-md border-2 border-gray-200 dark:border-gray-600">
                    <img
                      className="h-full w-full object-cover bg-white dark:bg-gray-800"
                      src={product.thumbnail}
                      alt={product.title}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SKU: {product.sku}
                    </p>
                    
                    {/* Price and Status Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {product.salePrice ? (
                          <>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(product.salePrice)}$</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price)}$</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}$</span>
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                    
                    {/* Category and Stock */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {getCategoryName(product.categoryId)}
                      </span>
                      <div className="flex items-center">
                        <StockIcon className={`h-4 w-4 mr-1 ${stockStatus.color}`} />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => onViewDetails(product)}
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-all"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 transition-all"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {product.status === 'archived' ? (
                    <button
                      onClick={() => onUnarchive(product)}
                      className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-all"
                      title="Unarchive"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchive(product)}
                      className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 text-orange-600 dark:text-orange-400 transition-all"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(product)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Tablet & Desktop Table View with always-visible scrollbar */}
      <div className="hidden md:block">
        {/* Horizontal scroll indicator at top */}
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
          <span>← Swipe or scroll to see all columns →</span>
          <span className="font-medium">{products.length} products</span>
        </div>
        <div className="overflow-x-auto" style={{ overflowX: 'scroll' }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '900px' }}>
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const StockIcon = stockStatus.icon;
              
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-600">
                        <img
                          className="h-full w-full object-cover bg-white dark:bg-gray-800"
                          src={product.thumbnail}
                          alt={product.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {product.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {getCategoryName(product.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {getBrandName(product.brandId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      {getSupplierName(product.supplierId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      {product.salePrice ? (
                        <>
                          <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatPrice(product.salePrice)}$</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{formatPrice(product.price)}$</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}$</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StockIcon className={`h-5 w-5 mr-2 ${stockStatus.color}`} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(product.status)}`}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewDetails(product)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 transition-all duration-200 hover:scale-110"
                        title="Edit Product"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {product.status === 'archived' ? (
                        <button
                          onClick={() => onUnarchive(product)}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110"
                          title="Unarchive Product"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onArchive(product)}
                          className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 text-orange-600 dark:text-orange-400 transition-all duration-200 hover:scale-110"
                          title="Archive Product"
                        >
                          <Archive className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(product)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110"
                        title="Delete Product"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

interface FiltersProps {
  categories: any[];
  brands: any[];
  suppliers: any[];
  filters: any;
  onFiltersChange: (filters: any) => void;
}

function Filters({ categories, brands, suppliers, filters, onFiltersChange }: FiltersProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          Filters
        </h3>
        <button
          onClick={() => onFiltersChange({ category: '', brand: '', supplier: '', status: '', stock: '' })}
          className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium text-xs"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand</label>
          <select
            value={filters.brand}
            onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 text-sm"
          >
            <option value="">All Brands</option>
            <option value="no-brand">No Brand / Generic</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
          <select
            value={filters.supplier}
            onChange={(e) => onFiltersChange({ ...filters, supplier: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200 text-sm"
          >
            <option value="">All Suppliers</option>
            <option value="no-supplier">No Supplier / Direct Purchase</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock Level</label>
          <select
            value={filters.stock}
            onChange={(e) => onFiltersChange({ ...filters, stock: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200 text-sm"
          >
            <option value="">All Stock Levels</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock (&lt; 10)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { products, categories, brands, loadingProducts, deleteProduct, updateProduct, siteSettings, getProducts } = useCatalog();
  const { suppliers } = useSuppliers();
  const { addActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    supplier: '',
    status: '',
    stock: ''
  });

  // Load products (exclude archived by default)
  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = filters.category === '' || product.categoryId === filters.category;

    // Brand filter
    const matchesBrand = filters.brand === '' || 
      (filters.brand === 'no-brand' && !product.brandId) ||
      product.brandId === filters.brand;

    // Supplier filter
    const matchesSupplier = filters.supplier === '' || 
      (filters.supplier === 'no-supplier' && !product.supplierId) ||
      product.supplierId === filters.supplier;

    // Status filter
    const matchesStatus = filters.status === '' || product.status === filters.status;

    // Stock filter
    const lowStockThreshold = siteSettings?.notifications?.lowStockThreshold || 5;
    let matchesStock = true;
    if (filters.stock === 'in-stock') matchesStock = product.stock > lowStockThreshold;
    else if (filters.stock === 'low-stock') matchesStock = product.stock > 0 && product.stock < lowStockThreshold;
    else if (filters.stock === 'out-of-stock') matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesSupplier && matchesStatus && matchesStock;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const handleArchive = async (product: Product) => {
    if (window.confirm(`Are you sure you want to archive "${product.title}"?`)) {
      try {
        await updateProduct(product.id, { ...product, status: 'archived' });
        addActivity({
          type: 'product',
          action: 'status_changed',
          title: product.title,
          description: `Archived product: ${product.title}`
        });
        // Refresh list (exclude archived so item disappears)
        getProducts();
      } catch (error) {
        console.error('Error archiving product:', error);
      }
    }
  };

  const handleUnarchive = async (product: Product) => {
    try {
      await updateProduct(product.id, { ...product, status: 'active' });
      addActivity({
        type: 'product',
        action: 'status_changed',
        title: product.title,
        description: `Unarchived product: ${product.title}`
      });
      // Refresh list
      getProducts();
    } catch (error) {
      console.error('Error unarchiving product:', error);
    }
  };

  const handleViewDetails = (product: Product) => {
    setDetailsProduct(product);
    setSelectedImageIndex(0); // Reset to first image when opening details
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleCloseDetails = () => {
    setDetailsProduct(null);
    setSelectedImageIndex(0);
  };

  if (loadingProducts) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="flex gap-6">
          <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-96 animate-pulse"></div>
          
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center mb-2">
              <Package className="h-8 w-8 mr-3" />
              Products Management
            </h2>
            <p className="text-blue-100 dark:text-gray-300 text-lg">
              Manage your product catalog ({filteredProducts.length} of {products.length} products)
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 text-sm"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(prev => !prev)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-all duration-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters Panel (collapsed by default, open manually) */}
      {showFilters && (
        <Filters
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* Products Table */}
      <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <ProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              siteSettings={siteSettings}
            />
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-16 text-center border border-gray-200 dark:border-gray-700">
              <Package className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first product'
                }
              </p>
              {!searchTerm && !Object.values(filters).some(f => f) && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-6 w-6 mr-3" />
                  Add Your First Product
                </button>
              )}
            </div>
          )}
      </div>

      {/* Product Form Modal */}
      <ProductForm
        product={editingProduct}
        isOpen={showAddForm}
        onClose={handleCloseForm}
      />

      {/* Product Details Modal */}
      {detailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 backdrop-blur-md bg-black/20" onClick={handleCloseDetails} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Product Details</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <img
                    src={detailsProduct.images?.[selectedImageIndex] || detailsProduct.thumbnail || ''}
                    alt={detailsProduct.title}
                    className="w-full h-48 sm:h-56 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  {detailsProduct.images?.length > 1 && (
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      {detailsProduct.images.slice(0, 10).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImageIndex(i)}
                          className={`h-12 sm:h-16 w-full object-cover rounded border-2 transition-all duration-200 ${
                            i === selectedImageIndex
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`img-${i}`} 
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{detailsProduct.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">SKU: {detailsProduct.sku}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Category: {categories.find(c => c.id === detailsProduct.categoryId)?.name || '—'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Brand: {detailsProduct.brandId ? (brands.find(b => b.id === detailsProduct.brandId)?.name || '—') : 'No Brand'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Supplier: {detailsProduct.supplierId ? (suppliers.find(s => s.id === detailsProduct.supplierId)?.name || '—') : 'No Supplier'}</p>
                  <div className="flex items-center gap-2 sm:gap-3 pt-2 flex-wrap">
                    {detailsProduct.salePrice ? (
                      <>
                        <span className="text-lg sm:text-xl font-bold text-red-600">{detailsProduct.salePrice}$</span>
                        <span className="text-xs sm:text-sm text-gray-500 line-through">{detailsProduct.price}$</span>
                      </>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{detailsProduct.price}$</span>
                    )}
                    <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Stock: {detailsProduct.stock}</span>
                    <span className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Status: {detailsProduct.status}</span>
                  </div>
                  {detailsProduct.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 pt-2">{detailsProduct.description}</p>
                  )}
                </div>
              </div>
              {detailsProduct.specs && Object.keys(detailsProduct.specs).length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(detailsProduct.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{key}</span>
                        <span className="text-gray-900 dark:text-gray-200">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function ProductForm({ product, isOpen, onClose }: ProductFormProps) {
  const { categories, brands, createProduct, updateProduct, uploadProductImage } = useCatalog();
  const { suppliers } = useSuppliers();
  const [formData, setFormData] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    brandId: product?.brandId || '',
    supplierId: product?.supplierId || '',
    price: String(product?.price || ''), // Always convert to string
    currency: product?.currency || 'USD',
    stock: product?.stock || '',
    status: product?.status || 'active' as const,
    tags: product?.tags.join(', ') || '',
    description: product?.description || '',
    specs: Object.entries(product?.specs || {}).map(([key, value]) => ({ key, value }))
  });
  
  // Size variants state
  const [variants, setVariants] = useState<{ id: string; name: string; price: string }[]>(
    product?.variants || []
  );
  
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [thumbnail, setThumbnail] = useState(product?.thumbnail || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // SKU Management States
  const [suggestedSKU, setSuggestedSKU] = useState('');
  const [skuValidation, setSKUValidation] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);
    const [checkingSKU, setCheckingSKU] = useState(false);
  

  // When modal opens or product changes, populate form with product data
  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        supplierId: product.supplierId || '',
        price: String(product.price || ''), // Always convert to string
        currency: product.currency || 'USD',
        stock: product.stock || '',
        status: product.status || 'active',
        tags: (product.tags || []).join(', '),
        description: product.description || '',
        specs: Object.entries(product.specs || {}).map(([key, value]) => ({ key, value }))
      });
      setVariants(product.variants || []);
      setImages(product.images || []);
      setThumbnail(product.thumbnail || '');
    } else {
      setFormData({
        title: '', slug: '', sku: '', categoryId: '', brandId: '', supplierId: '', price: '',
        currency: 'USD', stock: '', status: 'active', tags: '', description: '', specs: []
      });
      setVariants([]);
      setImages([]);
      setThumbnail('');
    }
  }, [isOpen, product]);

  // Auto-update thumbnail when images change
  useEffect(() => {
    if (images.length > 0 && !thumbnail) {
      setThumbnail(images[0]);
    }
  }, [images, thumbnail]);

  // Auto-generate SKU for new products
  useEffect(() => {
    const generateSKU = async () => {
      if (!product && !formData.sku) {
        try {
          const { SKUManager } = await import('../utils/skuManager');
          const nextSKU = await SKUManager.getNextAvailableSKU();
          setSuggestedSKU(nextSKU);
          setFormData(prev => ({ ...prev, sku: nextSKU }));
        } catch (error) {
          console.error('Error generating SKU:', error);
        }
      }
    };
    
    if (isOpen) {
      generateSKU();
    }
  }, [isOpen, product, formData.sku]);

  // Validate SKU when it changes
  useEffect(() => {
    const validateSKU = async () => {
      if (!formData.sku || formData.sku.trim() === '') {
        setSKUValidation(null);
        return;
      }

      setCheckingSKU(true);
      try {
        const { SKUManager } = await import('../utils/skuManager');
        const validation = await SKUManager.validateSKU(formData.sku, product?.id);
        setSKUValidation(validation);
      } catch (error) {
        console.error('Error validating SKU:', error);
        setSKUValidation({ isValid: false, error: 'Error checking SKU' });
      } finally {
        setCheckingSKU(false);
      }
    };

    const timeoutId = setTimeout(validateSKU, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [formData.sku, product?.id]);

  const handleSKUChange = (value: string) => {
    setFormData(prev => ({ ...prev, sku: value }));
  };

  const handleUseSuggestedSKU = () => {
    if (suggestedSKU) {
      setFormData(prev => ({ ...prev, sku: suggestedSKU }));
    }
  };

  const handleGenerateNewSKU = async () => {
    try {
      const { SKUManager } = await import('../utils/skuManager');
      const nextSKU = await SKUManager.getNextAvailableSKU();
      setSuggestedSKU(nextSKU);
      setFormData(prev => ({ ...prev, sku: nextSKU }));
    } catch (error) {
      console.error('Error generating new SKU:', error);
      alert('Error generating SKU. Please try again.');
    }
  };

const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    console.log('Form: Starting image upload...', file);
    setUploading(true);
    try {
      // Generate a unique ID for the upload session
      const uploadId = Date.now().toString();
      console.log('Form: Calling uploadProductImage with uploadId:', uploadId);
      const imageUrl = await uploadProductImage(file, uploadId);
      console.log('Form: Image uploaded successfully, URL:', imageUrl);
      setImages(prev => {
        const newImages = [...prev, imageUrl];
        // Update thumbnail to the first image (most recent upload if it's the first one)
        if (newImages.length === 1 || !thumbnail) {
          setThumbnail(imageUrl);
        }
        return newImages;
      });
    } catch (error) {
      console.error('Form: Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.categoryId || !formData.sku.trim()) {
      alert('Please fill in all required fields (Title, Category, SKU)');
      return;
    }
    
    // Check SKU validation
    if (skuValidation && !skuValidation.isValid) {
      alert(`SKU Error: ${skuValidation.error}`);
      return;
    }
    
    setSaving(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const specs = formData.specs.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Filter out empty variants
      const validVariants = variants.filter(v => v.name.trim() && v.price.trim());
      
      const productData = {
        title: formData.title.trim(),
        slug,
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        supplierId: formData.supplierId,
        price: formData.price,
        currency: formData.currency,
        stock: parseInt(String(formData.stock)) || 0,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        description: formData.description.trim(),
        specs,
        variants: validVariants, // Include size variants
        images,
        thumbnail: images[0] || thumbnail || '' // Always use first image as thumbnail
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }
      
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        slug: '',
        sku: '',
        categoryId: '',
        brandId: '',
        supplierId: '',
        price: '',
        currency: 'USD',
        stock: '',
        status: 'active',
        tags: '',
        description: '',
        specs: []
      });
      setImages([]);
      setThumbnail('');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { key: '', value: '' }]
    }));
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const removeSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    if (thumbnail === imageToRemove) {
      setThumbnail(images[0] || '');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 backdrop-blur-md bg-black/20" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {product ? 'Edit Product' : 'Add Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Enhanced SKU Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU (Product Code) *
                {suggestedSKU && formData.sku !== suggestedSKU && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    Suggested: {suggestedSKU}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleSKUChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-24 ${
                    skuValidation?.isValid === false
                      ? 'border-red-500 dark:border-red-400'
                      : skuValidation?.isValid === true
                      ? 'border-green-500 dark:border-green-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="TC100"
                  required
                />
                {checkingSKU && (
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {!checkingSKU && skuValidation?.isValid === true && (
                  <div className="absolute inset-y-0 right-2 flex items-center text-green-500">
                    ✓
                  </div>
                )}
                {!checkingSKU && skuValidation?.isValid === false && (
                  <div className="absolute inset-y-0 right-2 flex items-center text-red-500">
                    ⚠
                  </div>
                )}
              </div>
              
              {/* SKU Actions */}
              <div className="mt-2 flex gap-2 text-xs">
                {suggestedSKU && formData.sku !== suggestedSKU && (
                  <button
                    type="button"
                    onClick={handleUseSuggestedSKU}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Use suggested: {suggestedSKU}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGenerateNewSKU}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Generate new SKU
                </button>
              </div>
              
              {/* SKU Validation Message */}
              {skuValidation?.error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {skuValidation.error}
                </p>
              )}
              {skuValidation?.isValid && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  SKU is available ✓
                </p>
              )}
              
              {/* SKU Info */}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {product ? 'Current product SKU' : 'Auto-generated starting from TC100'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No Brand / Generic</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(Optional)</span>
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No Supplier / Direct Purchase</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  $
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || '' })}
                onFocus={(e) => e.target.select()}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Size Variants (Optional) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Size Variants (Optional)
              </label>
              <button
                type="button"
                onClick={() => setVariants([...variants, { id: Date.now().toString(), name: '', price: '' }])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Size
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Add different sizes with their own prices. Leave empty if product has no size options.
            </p>
            
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-2">
                No size variants added. Click "Add Size" to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].name = e.target.value;
                        setVariants(newVariants);
                      }}
                      placeholder="Size name (e.g., 35 cm, Large)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].price = e.target.value;
                          setVariants(newVariants);
                        }}
                        placeholder="Price"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                        $
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="gaming, laptop, high-performance"
            />
          </div>

          {/* Images */}
          <div>
            <MediaSelector
              label="Product Images"
              currentImage={thumbnail}
              onSelect={(url) => {
                if (url && !images.includes(url)) {
                  setImages(prev => [...prev, url]);
                }
                if (!thumbnail && url) {
                  setThumbnail(url);
                }
              }}
              required
            />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-300"
                  >
                    ×
                  </button>
                  {thumbnail === image && (
                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      Main
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setThumbnail(image)}
                    className="absolute bottom-1 right-1 bg-gray-800/70 text-white text-xs px-2 py-0.5 rounded hover:bg-gray-800 transition-all duration-300"
                  >
                    Set Main
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Specifications
              </label>
              <button
                type="button"
                onClick={addSpec}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
              >
                + Add Specification
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.specs.map((spec, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpec(index, 'key', e.target.value)}
                    placeholder="Property (e.g., RAM)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                    placeholder="Value (e.g., 16GB DDR4)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 self-end sm:self-auto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
