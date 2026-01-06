import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, ExternalLink } from 'lucide-react';
import { useServices } from '../contexts/ServicesContext';
import OptimizedImage from '../components/OptimizedImage';

const ServicesPage: React.FC = () => {
  const { mainServices, subServices, generateWhatsAppUrl } = useServices();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const handleWhatsAppClick = (message: string) => {
    const url = generateWhatsAppUrl(message);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-3 flex items-center justify-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <span>Our Services</span>
            </h1>
            <p className="text-sm text-blue-100 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
              Discover our comprehensive range of services designed to meet your technology needs. 
              Click on any service to explore detailed options and get in touch with us.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-13">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {mainServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
            >
              {/* Service Image - keep full image without cropping */}
              <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-contain p-2"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${service.image ? 'hidden' : 'flex'}`}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">Service Image</span>
                  </div>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed text-sm">
                  {service.description}
                </p>

                {/* Expand/Collapse Button */}
                {service.subServices.length > 0 && (
                  <button
                    onClick={() => toggleService(service.id)}
                    className="flex items-center justify-center w-full py-2 px-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 text-purple-700 dark:text-purple-300 rounded-lg hover:from-purple-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 mb-4 font-semibold shadow-sm hover:shadow-md text-sm"
                  >
                    <span className="mr-2">
                      {expandedService === service.id ? 'Hide' : 'View'} Sub-Services
                    </span>
                    {expandedService === service.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* WhatsApp Button */}
                <button
                  onClick={() => handleWhatsAppClick(service.whatsappMessage)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.02] text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact via WhatsApp
                </button>
              </div>

              {/* Sub-Services */}
              <AnimatePresence>
                {expandedService === service.id && service.subServices.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="p-5">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Available Sub-Services</span>
                      </h4>
                      <div className="space-y-3">
                        {service.subServices.map((subService, subIndex) => (
                          <motion.div
                            key={subService.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: subIndex * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                          >
                            <div className="flex items-start space-x-4">
                              {/* Sub-Service Image - keep full image without cropping */}
                              <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600">
                                {subService.image ? (
                                  <img
                                    src={subService.image}
                                    alt={subService.title}
                                    className="w-full h-full object-contain p-1"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center ${subService.image ? 'hidden' : 'flex'}`}>
                                  <MessageCircle className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                                </div>
                              </div>

                              {/* Sub-Service Content with button beside text */}
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <h5 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                                    {subService.title}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {subService.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleWhatsAppClick(subService.whatsappMessage)}
                                  className="shrink-0 inline-flex items-center text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-1.5 rounded-md transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  Contact
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {mainServices.length === 0 && (
          <div className="text-center py-13 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              No Services Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Services will appear here once they are added by the administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
