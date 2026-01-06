import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  Facebook,
  Share2,
  Copy,
  Check,
  Instagram,
  Music
} from 'lucide-react';

export default function ContactPage() {
  const { siteSettings, loadingSiteSettings, getSiteSettings } = useCatalog();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [copied, setCopied] = useState(false);

  // Load site settings when component mounts
  useEffect(() => {
    if (!siteSettings && !loadingSiteSettings) {
      getSiteSettings();
    }
  }, [siteSettings, loadingSiteSettings, getSiteSettings]);

  // Show loading state if settings are still loading
  if (loadingSiteSettings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading contact information...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Simple solution: Create a mailto link with all the form data
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from TopComputers contact form
Date: ${new Date().toLocaleString()}
      `.trim();

      const contactEmail = siteSettings?.contactEmail || siteSettings?.contactInfo?.email || 'topcomputers.lb@gmail.com';
      const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent('Contact Form: ' + formData.subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // For now, open the user's email client
      window.location.href = mailtoLink;
      
      // Show success message
      setSubmitStatus('success');
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in at least your name, email, and message before sending to WhatsApp.');
      return;
    }

    const whatsappMessage = `
🔥 *New Contact Message*

👤 *Name:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Phone:* ${formData.phone || 'Not provided'}
📋 *Subject:* ${formData.subject || 'General Inquiry'}

💬 *Message:*
${formData.message}

_Sent via TopComputers website contact form_
    `.trim();

    const contactPhone = siteSettings?.contactPhone || siteSettings?.contactInfo?.phone || '96176601305';
    const whatsappUrl = `https://wa.me/${contactPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent('Check out TopComputers - Your Technology Partner!');
    
    const urls = {
      facebook: 'https://www.facebook.com/share/1XBtNG4dKn/',
      instagram: 'https://www.instagram.com/topcomputers.lb/',
      tiktok: 'https://www.tiktok.com/@topcompters.lb?_t=ZS-8zmn6rMP5rb&_r=1',
      whatsapp: `https://wa.me/96176601305?text=${text}%20${url}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-1 sm:px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center space-x-1">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
            </div>
            <span>Get in Touch</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Home</Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">Contact</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-fit border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Contact Information</span>
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {siteSettings?.contactPhone || siteSettings?.contactInfo?.phone || '+961 76 601 305'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {siteSettings?.contactEmail || siteSettings?.contactInfo?.email || 'info@topcomputers.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-100 dark:border-red-800">
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Address</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">
                      {siteSettings?.contactAddress || siteSettings?.contactInfo?.address || 'Ansar, South Lebanon'}
                    </p>
                      <div className="mt-2">
                        <a
                          href="https://maps.app.goo.gl/ZmGMfWyAvoBD3Muo7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View Location on Google Maps
                        </a>
                      </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {siteSettings?.businessHours || siteSettings?.contactInfo?.hours || 'Monday - Saturday: 9:00 AM - 6:00 PM'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media & Share */}
              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Follow Us</span>
                </h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('instagram')}
                    className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Instagram className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('tiktok')}
                    className="p-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Music className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleShare('whatsapp')}
                    className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Link copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy website link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Send us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="+961 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none shadow-sm hover:shadow-md"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        Message sent successfully! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
                      <p className="text-red-700 dark:text-red-300 font-medium">
                        Failed to send message. Please try again or contact us via WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleWhatsAppSubmit}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Find Us</span>
            </h2>
            <div className="flex flex-col items-center justify-center">
              <iframe
                title="Google Maps Location"
                src="https://www.google.com/maps?q=33.374977,35.369447&z=17&output=embed"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="mt-6 text-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">TopCoders&Computers, Ansar, Janoub, Lebanon</span>
                <a
                  href="https://maps.app.goo.gl/9GBC1tMKTH28gHu36"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors mt-3 text-lg"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
