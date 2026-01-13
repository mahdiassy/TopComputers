import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CatalogProvider, useCatalog } from './contexts/CatalogContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { SuppliersProvider } from './contexts/SuppliersContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { MediaProvider } from './contexts/MediaContext';
import PersistentCartIcon from './components/PersistentCartIcon';
import MobileBottomNav from './components/MobileBottomNav';
import MaintenanceMode from './components/MaintenanceMode';

// CartProviderWrapper component to pass products from CatalogProvider to CartProvider
function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  const { products } = useCatalog();
  return <CartProvider products={products}>{children}</CartProvider>;
}

// Layout Components
import StorefrontLayout from './components/StorefrontLayout';

// Public Pages
import StorefrontHome from './pages/StorefrontHome';
import CatalogPage from './pages/CatalogPage';
import ProductDetails from './pages/ProductDetails';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
// Services Pages
import ServicesPage from './pages/ServicesPage.tsx';
import ServiceDetailPage from './pages/ServiceDetailPage.tsx';
// Cart and checkout pages removed - using WhatsApp order flow instead

// Auth Pages
import Login from './pages/Login';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminBrands from './pages/AdminBrands';
import AdminSuppliers from './pages/AdminSuppliers';
import AdminSupplierProducts from './pages/AdminSupplierProducts';
import AdminServicesUnified from './pages/AdminServicesUnified';
import AdminSettings from './pages/AdminSettings';
import AdminActivityLog from './pages/AdminActivityLog';
import AdminArchive from './pages/AdminArchive';
import AdminMedia from './pages/AdminMedia';

// Other Pages
import NotFound from './pages/NotFound';

// Protected Route Component for Admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) return <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Loading...</div>;
  
  if (!currentUser || !userData?.isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Maintenance Mode Wrapper - checks if site is in maintenance mode
const MaintenanceModeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { siteSettings, loadingSiteSettings } = useCatalog();
  const { currentUser, userData, loading: authLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Maintenance Check:', {
      enabled: siteSettings?.maintenance?.enabled,
      isAdmin: currentUser && userData?.isAdmin,
      isAdminRoute: location.pathname.startsWith('/admin'),
      pathname: location.pathname
    });
  }, [siteSettings, currentUser, userData, location.pathname]);

  // Show loading while checking settings
  if (loadingSiteSettings || authLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  // Allow admin users to bypass maintenance mode
  const isAdmin = currentUser && userData?.isAdmin;
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Show maintenance mode if enabled and user is not admin (or not on admin routes)
  if (siteSettings?.maintenance?.enabled && !isAdmin && !isAdminRoute) {
    console.log('🚧 Showing maintenance mode');
    return <MaintenanceMode />;
  }

  return <>{children}</>;
};

function App() {
  const handleSecretGesture = () => {
    // Navigate to admin login
    window.location.href = '/admin/login';
  };

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <ActivityProvider>
            <ServicesProvider>
              <SuppliersProvider>
                <MediaProvider>
                  <CatalogProvider>
                    <MaintenanceModeWrapper>
                    <CartProviderWrapper>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      className: 'dark:bg-gray-800 dark:text-white dark:border-gray-600',
                      style: {
                        background: 'var(--toast-bg, #fff)',
                        color: 'var(--toast-color, #000)',
                        border: '1px solid var(--toast-border, #e5e7eb)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      },
                      success: {
                        style: {
                          background: 'var(--toast-bg, #fff)',
                          color: 'var(--toast-color, #000)',
                          border: '1px solid var(--toast-border, #e5e7eb)',
                        },
                        className: 'dark:bg-green-900/90 dark:text-green-100 dark:border-green-700',
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        style: {
                          background: 'var(--toast-bg, #fff)',
                          color: 'var(--toast-color, #000)',
                          border: '1px solid var(--toast-border, #e5e7eb)',
                        },
                        className: 'dark:bg-red-900/90 dark:text-red-100 dark:border-red-700',
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                    containerStyle={{
                      top: 20,
                      right: 20,
                    }}
                  />
                  
                  {/* Persistent Cart Icon */}
                  <PersistentCartIcon />
                  
                  {/* Mobile Bottom Navigation */}
                  <MobileBottomNav />
                  
                  <Routes>
                    {/* Public Routes with Storefront Layout */}
                    <Route path="/" element={<StorefrontLayout onSecretGesture={handleSecretGesture} />}>
                      <Route index element={<StorefrontHome />} />
                      <Route path="catalog" element={<CatalogPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="brands" element={<BrandsPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="services" element={<ServicesPage />} />
                      <Route path="services/:slug" element={<ServiceDetailPage />} />
                      <Route path="product/:slug" element={<ProductDetails />} />
                    </Route>
                    
                    {/* Auth Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="brands" element={<AdminBrands />} />
                      <Route path="media" element={<AdminMedia />} />
                      <Route path="suppliers" element={<AdminSuppliers />} />
                      <Route path="suppliers/:supplierId/products" element={<AdminSupplierProducts />} />
                      <Route path="services" element={<AdminServicesUnified />} />
                      <Route path="activity" element={<AdminActivityLog />} />
                      <Route path="users" element={<div>Users Management (Coming Soon)</div>} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="archive" element={<AdminArchive />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                    </CartProviderWrapper>
                    </MaintenanceModeWrapper>
                  </CatalogProvider>
                </MediaProvider>
              </SuppliersProvider>
            </ServicesProvider>
          </ActivityProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
}

export default App;
