import { motion } from 'framer-motion';
import { Wrench, Clock, RefreshCw } from 'lucide-react';
import { useCatalog } from '../contexts/CatalogContext';

export default function MaintenanceMode() {
  const { siteSettings } = useCatalog();

  const title = siteSettings?.maintenance?.title || '🔧 We\'ll Be Right Back!';
  const message = siteSettings?.maintenance?.message || 
    'We\'re currently performing scheduled maintenance to improve your experience. We\'ll be back online shortly. Thank you for your patience! 💙';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-orange-800 p-8 md:p-12">
          {/* Animated Icon */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 p-6 rounded-full shadow-lg">
              <Wrench className="h-16 w-16 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {title}
          </h1>

          {/* Message */}
          <p className="text-lg md:text-xl text-center text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-800"
            >
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Scheduled</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Maintenance</p>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800"
            >
              <RefreshCw className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 animate-spin" style={{ animationDuration: '3s' }} />
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Upgrading</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Systems</p>
            </motion.div>

            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Wrench className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              </motion.div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Coming Back</p>
              <p className="text-xs text-green-600 dark:text-green-400">Soon</p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Need immediate assistance? Contact us:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${siteSettings?.contactEmail || 'support@example.com'}`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                📧 Email Us
              </a>
              {siteSettings?.whatsapp?.number && (
                <a
                  href={`https://wa.me/${siteSettings.whatsapp.number.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔄 This page will automatically refresh when we're back online
          </p>
        </motion.div>
      </motion.div>

      {/* Auto-refresh script - check every 30 seconds */}
      <script dangerouslySetInnerHTML={{
        __html: `
          setInterval(() => {
            window.location.reload();
          }, 30000);
        `
      }} />
    </div>
  );
}
