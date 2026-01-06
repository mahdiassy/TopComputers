import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useServices, type ServiceBlock } from '../contexts/ServicesContext';
import { 
  ArrowRight, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Youtube, 
  Code, 
  Wrench, 
  Palette,
  Monitor,
  Smartphone,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Award,
  Mail
} from 'lucide-react';

const ServicesPage: React.FC = () => {
  const { publishedServiceBlocks, loading, error } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState<ServiceBlock[]>([]);

  useEffect(() => {
    let filtered = publishedServiceBlocks;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service =>
        service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredServices(filtered);
  }, [publishedServiceBlocks, searchTerm, selectedCategory]);

  const categories = ['all', ...new Set(publishedServiceBlocks.map(service => service.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading our amazing services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Unavailable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('program') || categoryLower.includes('develop') || categoryLower.includes('code')) {
      return <Code className="w-6 h-6" />;
    }
    if (categoryLower.includes('repair') || categoryLower.includes('fix') || categoryLower.includes('maintenance')) {
      return <Wrench className="w-6 h-6" />;
    }
    if (categoryLower.includes('design') || categoryLower.includes('graphic') || categoryLower.includes('creative')) {
      return <Palette className="w-6 h-6" />;
    }
    if (categoryLower.includes('computer') || categoryLower.includes('desktop') || categoryLower.includes('pc')) {
      return <Monitor className="w-6 h-6" />;
    }
    if (categoryLower.includes('mobile') || categoryLower.includes('phone') || categoryLower.includes('tablet')) {
      return <Smartphone className="w-6 h-6" />;
    }
    return <ArrowRight className="w-6 h-6" />;
  };

  const formatWhatsAppMessage = (service: ServiceBlock) => {
    const message = service.whatsappMessage || 
      `Hi Top Computers! I'm interested in your "${service.title}" service. Can you provide more information and pricing?`;
    return encodeURIComponent(message);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Enhanced Design */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/30 to-transparent"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Shield className="w-8 h-8" />
              </div>
              <span className="bg-blue-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                Professional Tech Services
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Premium Technology
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Solutions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              From repairs and upgrades to custom development and design. 
              We deliver excellence with every service, backed by years of expertise.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Expert Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Fast Turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'All Services' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {searchTerm || selectedCategory !== 'all' ? 'No Services Found' : 'No Services Available'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Check back soon for our exciting service offerings!'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedCategory === 'all' 
                  ? `Our ${filteredServices.length} Premium Services` 
                  : `${filteredServices.length} ${selectedCategory} Services`
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Each service is designed to deliver exceptional results with attention to detail and professional excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700"
                >
                  {/* Service Image */}
                  {service.mainImage && (
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={service.mainImage} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-full p-3 text-white">
                        {getCategoryIcon(service.category)}
                      </div>
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {service.category}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Applications Preview */}
                    {service.applications && service.applications.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Featured Tools & Software:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.applications.slice(0, 4).map((app, index) => (
                            <div 
                              key={index} 
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-3 py-2 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 border border-blue-200 dark:border-blue-700"
                            >
                              {app.icon && (
                                <img src={app.icon} alt={app.name} className="w-4 h-4 object-contain" />
                              )}
                              <span>{app.name}</span>
                            </div>
                          ))}
                          {service.applications.length > 4 && (
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                              +{service.applications.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Content Preview */}
                    {service.contentSections && service.contentSections.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          What We Deliver:
                        </h4>
                        <div className="space-y-2">
                          {service.contentSections.slice(0, 3).map((content, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="line-clamp-1">{content.title}</span>
                            </div>
                          ))}
                          {service.contentSections.length > 3 && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium pl-5">
                              +{service.contentSections.length - 3} more services included
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                      {/* Social Media Links */}
                      <div className="flex gap-2">
                        {service.instagramLink && (
                          <a
                            href={service.instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full"
                            title="Follow on Instagram"
                          >
                            <Instagram size={18} />
                          </a>
                        )}
                        {service.facebookLink && (
                          <a
                            href={service.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                            title="Like on Facebook"
                          >
                            <Facebook size={18} />
                          </a>
                        )}
                        {service.youtubeLink && (
                          <a
                            href={service.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Watch on YouTube"
                          >
                            <Youtube size={18} />
                          </a>
                        )}
                      </div>

                      {/* Contact Button */}
                      <a
                        href={`https://wa.me/1234567890?text=${formatWhatsAppMessage(service)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle size={16} />
                        Get Quote
                      </a>
                    </div>

                    {/* View Details Link */}
                    <Link
                      to={`/services/${service.slug}`}
                      className="block mt-4 text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                    >
                      View Complete Details
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Call to Action */}
      <div className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8 flex items-center justify-center">
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Need Something 
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Custom?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Don't see exactly what you need? We specialize in creating tailored solutions 
              that perfectly match your requirements and exceed your expectations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="https://wa.me/1234567890?text=Hi Top Computers! I'd like to discuss a custom solution for my specific needs."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center gap-3 shadow-2xl hover:shadow-green-500/25"
              >
                <MessageCircle size={24} />
                Discuss Your Project
              </a>
              
              <Link
                to="/contact"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center gap-3 border border-white/20"
              >
                <Mail size={24} />
                Send Email
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>100% Satisfaction Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Certified Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
