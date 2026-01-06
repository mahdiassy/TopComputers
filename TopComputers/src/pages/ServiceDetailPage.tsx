import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServices } from '../contexts/ServicesContext';
import { 
  ArrowLeft, 
  MessageCircle, 
  Instagram, 
  Facebook
} from 'lucide-react';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getServiceBlockBySlug, loading } = useServices();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  const service = slug ? getServiceBlockBySlug(slug) : null;

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleWhatsAppContact = (customMessage?: string) => {
    const message = customMessage || service.whatsappMessage || `Hi! I'm interested in your ${service.title} service. Could you please provide more information?`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Services
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">{service.title}</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                {service.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Service Image */}
        {service.mainImage && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-800">
              <img
                src={service.mainImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Full Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About This Service
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>

          {/* Content Sections */}
          {service.contentSections && service.contentSections.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Service Details
              </h2>
              <div className="space-y-6">
                {service.contentSections.map((content) => (
                  <div key={content.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {content.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {content.description}
                    </p>
                    {content.images && content.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {content.images.map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`${content.title} ${imgIndex + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications/Software */}
          {service.applications && service.applications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Applications & Software
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.applications.map((app) => (
                  <div key={app.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex items-center gap-4">
                    {app.icon && (
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-12 h-12 object-contain rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{app.category}</p>
                      {app.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {app.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Media & Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Get Started Today
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
              {/* Contact Button */}
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Ready to get started? Contact us via WhatsApp to discuss your requirements and schedule a consultation.
                </p>
                <button
                  onClick={() => handleWhatsAppContact()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={20} />
                  Contact via WhatsApp
                </button>
              </div>

              {/* Social Media Links */}
              {(service.instagramLink || service.facebookLink) && (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Follow us</p>
                  <div className="flex gap-4">
                    {service.instagramLink && (
                      <a
                        href={service.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
                      >
                        <Instagram size={24} />
                      </a>
                    )}
                    {service.facebookLink && (
                      <a
                        href={service.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Facebook size={24} />
                      </a>
                    )}
                    {/* TikTok intentionally omitted from detail page icons */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
