import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';
import type { SiteSettings } from '../types/catalog';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const { siteSettings, loadingSiteSettings, updateSiteSettings } = useCatalog();
  const [formData, setFormData] = useState<SiteSettings>({
    id: '',
    siteName: '',
    siteDescription: '',
    siteLogo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    businessHours: '',
    homeBanners: [],
    featuredCategories: [],
    featuredProducts: [],
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      hours: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
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
    updatedAt: new Date()
  });
  
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      // Ensure all required properties exist with defaults
      const mergedSettings = {
        ...siteSettings,
        whatsapp: {
          enabled: true,
          number: '+96176601305',
          message: 'Hello! I would like to place an order:',
          ...siteSettings.whatsapp
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
          },
          ...siteSettings.policies
        },
        features: {
          showStockCount: true,
          allowBackorders: false,
          requireLogin: false,
          enableReviews: true,
          enableWishlist: true,
          showReturnPolicy: true,
          ...siteSettings.features
        }
      };
      setFormData(mergedSettings);
    }
  }, [siteSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(formData);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (section: keyof SiteSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [field]: value
      }
    }));
  };

  if (loadingSiteSettings) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
        
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-10 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-900 dark:to-gray-700 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center mb-2">
              <Globe className="h-8 w-8 mr-3" />
              Site Settings
            </h2>
            <p className="text-indigo-100 dark:text-gray-300 text-lg">
              Manage your store configuration and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center px-4 py-3 border-2 border-white/30 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              {showAdvanced ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Settings */}
      <SettingsSection 
        title="Basic Information" 
        description="Configure your store's basic details and branding"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="h-4 w-4 inline mr-2" />
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="TopComputers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Logo URL
            </label>
            <input
              type="url"
              value={formData.siteLogo}
              onChange={(e) => updateField('siteLogo', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Description
            </label>
            <textarea
              value={formData.siteDescription}
              onChange={(e) => updateField('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="Your premier destination for computers and electronics"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Contact Information */}
      <SettingsSection 
        title="Contact Information" 
        description="Manage how customers can reach you"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="info@topcomputers.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Business Address
            </label>
            <input
              type="text"
              value={formData.contactAddress}
              onChange={(e) => updateField('contactAddress', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="123 Tech Street, Digital City, DC 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Business Hours
            </label>
            <input
              type="text"
              value={formData.businessHours}
              onChange={(e) => updateField('businessHours', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Store Features */}
      <SettingsSection 
        title="Store Features" 
        description="Configure what features are available to customers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showStockCount"
                checked={formData.features.showStockCount}
                onChange={(e) => updateNestedField('features', 'showStockCount', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="showStockCount" className="text-sm text-gray-700 dark:text-gray-300">
                Show stock count to customers
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowBackorders"
                checked={formData.features.allowBackorders}
                onChange={(e) => updateNestedField('features', 'allowBackorders', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="allowBackorders" className="text-sm text-gray-700 dark:text-gray-300">
                Allow backorders for out-of-stock items
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableReviews"
                checked={formData.features.enableReviews}
                onChange={(e) => updateNestedField('features', 'enableReviews', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="enableReviews" className="text-sm text-gray-700 dark:text-gray-300">
                Enable product reviews
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireLogin"
                checked={formData.features.requireLogin}
                onChange={(e) => updateNestedField('features', 'requireLogin', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="requireLogin" className="text-sm text-gray-700 dark:text-gray-300">
                Require login to view prices
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableWishlist"
                checked={formData.features.enableWishlist}
                onChange={(e) => updateNestedField('features', 'enableWishlist', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="enableWishlist" className="text-sm text-gray-700 dark:text-gray-300">
                Enable wishlist functionality
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showReturnPolicy"
                checked={formData.features.showReturnPolicy}
                onChange={(e) => updateNestedField('features', 'showReturnPolicy', e.target.checked)}
                className="mr-3"
              />
              <label htmlFor="showReturnPolicy" className="text-sm text-gray-700 dark:text-gray-300">
                Show return policy on product pages
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.notifications.lowStockThreshold}
                onChange={(e) => updateNestedField('notifications', 'lowStockThreshold', parseInt(e.target.value) || '')}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* WhatsApp Integration */}
      <SettingsSection 
        title="WhatsApp Integration" 
        description="Configure WhatsApp ordering system"
      >
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="whatsappEnabled"
              checked={formData.whatsapp?.enabled || false}
              onChange={(e) => updateNestedField('whatsapp', 'enabled', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="whatsappEnabled" className="text-sm text-gray-700 dark:text-gray-300">
              Enable WhatsApp ordering
            </label>
          </div>

          {formData.whatsapp?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  placeholder="+96176601305"
                  value={formData.whatsapp?.number || ''}
                  onChange={(e) => updateNestedField('whatsapp', 'number', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Message
                </label>
                <textarea
                  rows={3}
                  value={formData.whatsapp?.message || ''}
                  onChange={(e) => updateNestedField('whatsapp', 'message', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="Hello! I would like to place an order:"
                />
              </div>
            </>
          )}
        </div>
      </SettingsSection>

      {/* Policies Configuration */}
      <SettingsSection 
        title="Store Policies" 
        description="Configure shipping, warranty, and return policies"
      >
        <div className="space-y-6">
          {/* Return Policy */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Return Policy</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="returnPolicyEnabled"
                checked={formData.policies?.returnPolicy?.enabled || false}
                onChange={(e) => updateNestedField('policies', 'returnPolicy', { ...formData.policies?.returnPolicy, enabled: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="returnPolicyEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable return policy
              </label>
            </div>

            {formData.policies?.returnPolicy?.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Period (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.policies?.returnPolicy?.days || 30}
                    onChange={(e) => updateNestedField('policies', 'returnPolicy', { ...formData.policies?.returnPolicy, days: parseInt(e.target.value) || '' })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Policy Description
                  </label>
                  <input
                    type="text"
                    value={formData.policies?.returnPolicy?.description || ''}
                    onChange={(e) => updateNestedField('policies', 'returnPolicy', { ...formData.policies?.returnPolicy, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                    placeholder="30 day policy"
                  />
                </div>
              </>
            )}
          </div>

          {/* Warranty */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Warranty</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="warrantyEnabled"
                checked={formData.policies.warranty.enabled}
                onChange={(e) => updateNestedField('policies', 'warranty', { ...formData.policies.warranty, enabled: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="warrantyEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable warranty information
              </label>
            </div>

            {formData.policies.warranty.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    value={formData.policies.warranty.period}
                    onChange={(e) => updateNestedField('policies', 'warranty', { ...formData.policies.warranty, period: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                    placeholder="1 year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Warranty Description
                  </label>
                  <input
                    type="text"
                    value={formData.policies.warranty.description}
                    onChange={(e) => updateNestedField('policies', 'warranty', { ...formData.policies.warranty, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                    placeholder="1 year coverage"
                  />
                </div>
              </>
            )}
          </div>

          {/* Free Shipping */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Free Shipping</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="freeShippingEnabled"
                checked={formData.policies.shipping.freeShippingEnabled}
                onChange={(e) => updateNestedField('policies', 'shipping', { ...formData.policies.shipping, freeShippingEnabled: e.target.checked })}
                className="mr-3"
              />
              <label htmlFor="freeShippingEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable free shipping
              </label>
            </div>

            {formData.policies.shipping.freeShippingEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.policies.shipping.freeShippingThreshold}
                    onChange={(e) => updateNestedField('policies', 'shipping', { ...formData.policies.shipping, freeShippingThreshold: parseFloat(e.target.value) || '' })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Free Shipping Description
                  </label>
                  <input
                    type="text"
                    value={formData.policies.shipping.description}
                    onChange={(e) => updateNestedField('policies', 'shipping', { ...formData.policies.shipping, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                    placeholder="Orders over $100"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Advanced Settings */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Social Media */}
          <SettingsSection 
            title="Social Media" 
            description="Connect your social media profiles"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => updateNestedField('socialMedia', 'facebook', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="https://facebook.com/topcomputers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => updateNestedField('socialMedia', 'twitter', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="https://twitter.com/topcomputers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => updateNestedField('socialMedia', 'instagram', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="https://instagram.com/topcomputers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => updateNestedField('socialMedia', 'youtube', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="https://youtube.com/topcomputers"
                />
              </div>
            </div>
          </SettingsSection>

          {/* SEO Settings */}
          <SettingsSection 
            title="SEO Settings" 
            description="Optimize your store for search engines"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => updateNestedField('seo', 'metaTitle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="TopComputers - Your Premier Computer Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => updateNestedField('seo', 'metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="Discover the latest computers, laptops, and electronics at TopComputers. Quality products with competitive prices and excellent customer service."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.seo.metaKeywords}
                  onChange={(e) => updateNestedField('seo', 'metaKeywords', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="computers, laptops, electronics, technology, hardware"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Open Graph Image URL
                </label>
                <input
                  type="url"
                  value={formData.seo.ogImage}
                  onChange={(e) => updateNestedField('seo', 'ogImage', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 font-medium"
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </div>
          </SettingsSection>
        </motion.div>
      )}
    </div>
  );
}
