/**
 * Services Seed Data Script
 * Adds sample service blocks to the Firestore database
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyBE2KKq4_9QP7oRNL7dPbWlT3kDJ1MEkso",
  authDomain: "top-computers-store.firebaseapp.com",
  projectId: "top-computers-store",
  storageBucket: "top-computers-store.firebasestorage.app",
  messagingSenderId: "851037823772",
  appId: "1:851037823772:web:e0c4e8c2b8a8c0c8d4e8f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const serviceBlocks = [
  // Service Detail Block
  {
    type: 'serviceDetail',
    title: 'Computer Repair & Maintenance',
    summary: 'Professional computer repair services for hardware and software issues with same-day service available.',
    tags: ['repair', 'maintenance', 'hardware', 'software'],
    status: 'published',
    content: {
      description: `Our expert technicians provide comprehensive computer repair and maintenance services for both personal and business clients. We diagnose and fix hardware failures, software conflicts, virus infections, and performance issues.

With over 10 years of experience in the industry, we handle everything from simple software installations to complex motherboard repairs. Our diagnostic process ensures accurate problem identification, and we provide detailed explanations of all issues and solutions.

We offer both in-shop and on-site services to meet your convenience needs. All repairs come with a 90-day warranty on parts and labor, giving you peace of mind with every service.`,
      features: [
        'Free diagnostic assessment',
        'Same-day service available',
        '90-day warranty on repairs',
        'On-site and in-shop service options',
        'Data recovery and backup services',
        'Virus and malware removal',
        'Hardware upgrades and installations',
        'Software troubleshooting and optimization'
      ],
      pricing: `Basic diagnostic: $45
Standard repair: $85-150
Premium service with data backup: $175-250
On-site service: Additional $35 travel fee

Business contracts available with discounted rates for regular maintenance schedules.`
    },
    metadata: {
      author: 'Top Computers Service Team',
      lastModified: new Date().toISOString(),
      version: '1.0'
    },
    order: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },

  // Software Downloads Block
  {
    type: 'softwareDownloads',
    title: 'Essential PC Software & Drivers',
    summary: 'Download essential software tools, drivers, and utilities to keep your computer running smoothly.',
    tags: ['software', 'drivers', 'utilities', 'downloads'],
    status: 'published',
    content: {
      introduction: 'Access our curated collection of essential software tools and drivers. All downloads are scanned for malware and regularly updated to ensure compatibility and security.',
      downloads: [
        {
          title: 'System Diagnostic Tool',
          description: 'Comprehensive system analysis tool that checks hardware health, performance metrics, and identifies potential issues.',
          url: 'https://example.com/downloads/system-diagnostic-v2.1.exe',
          fileSize: '15.2 MB',
          version: '2.1.0',
          requirements: 'Windows 10/11, 4GB RAM minimum'
        },
        {
          title: 'Driver Update Utility',
          description: 'Automatically scan and update outdated drivers for optimal system performance and hardware compatibility.',
          url: 'https://example.com/downloads/driver-updater-v3.5.exe',
          fileSize: '8.7 MB',
          version: '3.5.2',
          requirements: 'Windows 10/11, Internet connection required'
        },
        {
          title: 'PC Cleanup & Optimization',
          description: 'Remove junk files, clean registry, and optimize system performance with our professional-grade cleanup tool.',
          url: 'https://example.com/downloads/pc-optimizer-v4.1.exe',
          fileSize: '22.5 MB',
          version: '4.1.8',
          requirements: 'Windows 10/11, 2GB RAM minimum'
        },
        {
          title: 'Data Backup Solution',
          description: 'Secure and reliable backup software for protecting your important files and system configurations.',
          url: 'https://example.com/downloads/backup-pro-v1.9.exe',
          fileSize: '45.3 MB',
          version: '1.9.4',
          requirements: 'Windows 10/11, 1GB free space'
        }
      ]
    },
    metadata: {
      author: 'Top Computers Tech Team',
      lastModified: new Date().toISOString(),
      version: '1.2'
    },
    order: 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },

  // FAQ Block
  {
    type: 'faq',
    title: 'Frequently Asked Questions',
    summary: 'Common questions about our services, pricing, warranties, and technical support.',
    tags: ['faq', 'support', 'questions', 'help'],
    status: 'published',
    content: {
      introduction: 'Find answers to the most commonly asked questions about our services. If you don\'t see your question here, feel free to contact us directly.',
      faqs: [
        {
          question: 'How long does a typical computer repair take?',
          answer: 'Most repairs are completed within 24-48 hours. Simple software issues can often be resolved the same day, while hardware repairs requiring parts may take 2-5 business days depending on part availability.'
        },
        {
          question: 'Do you offer warranties on your repair work?',
          answer: 'Yes, all our repair work comes with a 90-day warranty on both parts and labor. If the same issue occurs within the warranty period, we\'ll fix it at no additional charge.'
        },
        {
          question: 'Can you recover data from a crashed hard drive?',
          answer: 'We offer data recovery services for various failure types. Success rates depend on the type and extent of damage. We provide a free assessment and will inform you of recovery possibilities and costs before proceeding.'
        },
        {
          question: 'Do you provide on-site service?',
          answer: 'Yes, we offer on-site service for businesses and residential customers within a 25-mile radius. There\'s an additional $35 travel fee, but this can be more convenient for businesses or customers with multiple computers.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash, check, all major credit cards (Visa, MasterCard, American Express, Discover), and contactless payments including Apple Pay and Google Pay.'
        },
        {
          question: 'Can you help with virus removal?',
          answer: 'Absolutely! Virus and malware removal is one of our most common services. We use professional-grade tools to completely clean your system and can provide recommendations for ongoing protection.'
        },
        {
          question: 'Do you work on Mac computers?',
          answer: 'While we specialize in PC repair, we do provide basic Mac services including virus removal, software installation, and hardware diagnostics. For complex Mac repairs, we can refer you to certified Apple service providers.'
        },
        {
          question: 'How much does a typical repair cost?',
          answer: 'Repair costs vary depending on the issue. Our standard diagnostic fee is $45, and most common repairs range from $85-250. We always provide an estimate before beginning any work, and there are no hidden fees.'
        }
      ]
    },
    metadata: {
      author: 'Top Computers Support Team',
      lastModified: new Date().toISOString(),
      version: '1.3'
    },
    order: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },

  // Gallery Block
  {
    type: 'gallery',
    title: 'Our Workshop & Recent Projects',
    summary: 'Take a look at our professional workshop facility and some of our recent repair and build projects.',
    tags: ['gallery', 'workshop', 'projects', 'facility'],
    status: 'published',
    content: {
      introduction: 'Get a behind-the-scenes look at our state-of-the-art repair facility and see examples of our quality workmanship on recent customer projects.',
      images: [
        {
          url: '/images/services/workshop-main.jpg',
          alt: 'Main workshop area with diagnostic stations',
          caption: 'Our main workshop featuring professional diagnostic stations and clean work environments'
        },
        {
          url: '/images/services/repair-station.jpg',
          alt: 'Component-level repair station with precision tools',
          caption: 'Precision repair station equipped with specialized tools for component-level repairs'
        },
        {
          url: '/images/services/custom-build.jpg',
          alt: 'Custom gaming PC build in progress',
          caption: 'Custom gaming PC build featuring RGB lighting and premium components'
        },
        {
          url: '/images/services/data-recovery.jpg',
          alt: 'Data recovery lab with clean room protocols',
          caption: 'Specialized data recovery lab following clean room protocols for sensitive drives'
        },
        {
          url: '/images/services/testing-area.jpg',
          alt: 'System testing and quality assurance area',
          caption: 'Quality assurance testing area where all repairs undergo final testing'
        },
        {
          url: '/images/services/parts-inventory.jpg',
          alt: 'Organized parts inventory and storage',
          caption: 'Comprehensive parts inventory ensuring quick turnaround times'
        }
      ]
    },
    metadata: {
      author: 'Top Computers Media Team',
      lastModified: new Date().toISOString(),
      version: '1.0'
    },
    order: 4,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },

  // Custom HTML Block
  {
    type: 'customHTML',
    title: 'Service Request Form',
    summary: 'Submit a service request online and schedule an appointment for your computer repair needs.',
    tags: ['form', 'request', 'appointment', 'contact'],
    status: 'published',
    content: {
      html: `<div class="service-request-form">
  <div class="form-header">
    <h3>Schedule Your Service Appointment</h3>
    <p>Fill out the form below to request service and we'll contact you within 24 hours to confirm your appointment.</p>
  </div>
  
  <form id="serviceRequestForm" action="https://formsubmit.co/service@topcomputers.com" method="POST">
    <input type="hidden" name="_subject" value="New Service Request from Website">
    <input type="hidden" name="_captcha" value="false">
    <input type="hidden" name="_next" value="https://topcomputers.com/services?submitted=true">
    
    <div class="form-grid">
      <div class="form-group">
        <label for="customerName">Full Name *</label>
        <input type="text" id="customerName" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="customerEmail">Email Address *</label>
        <input type="email" id="customerEmail" name="email" required>
      </div>
      
      <div class="form-group">
        <label for="customerPhone">Phone Number *</label>
        <input type="tel" id="customerPhone" name="phone" required>
      </div>
      
      <div class="form-group">
        <label for="serviceType">Service Type</label>
        <select id="serviceType" name="service_type">
          <option value="">Select a service</option>
          <option value="diagnostic">Diagnostic & Repair</option>
          <option value="virus-removal">Virus/Malware Removal</option>
          <option value="data-recovery">Data Recovery</option>
          <option value="upgrade">Hardware Upgrade</option>
          <option value="maintenance">Preventive Maintenance</option>
          <option value="custom-build">Custom PC Build</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
    
    <div class="form-group full-width">
      <label for="deviceInfo">Device Information</label>
      <input type="text" id="deviceInfo" name="device_info" placeholder="e.g., Dell Inspiron 15, Desktop PC, etc.">
    </div>
    
    <div class="form-group full-width">
      <label for="problemDescription">Problem Description *</label>
      <textarea id="problemDescription" name="problem_description" rows="4" required placeholder="Please describe the issues you're experiencing with your computer..."></textarea>
    </div>
    
    <div class="form-group full-width">
      <label for="preferredDate">Preferred Service Date</label>
      <input type="date" id="preferredDate" name="preferred_date">
    </div>
    
    <div class="form-group full-width">
      <div class="checkbox-group">
        <input type="checkbox" id="urgentService" name="urgent_service" value="yes">
        <label for="urgentService">This is an urgent service request</label>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="submit" class="submit-btn">Submit Service Request</button>
      <p class="form-note">We'll contact you within 24 hours to confirm your appointment.</p>
    </div>
  </form>
</div>`,
      css: `.service-request-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h3 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  text-align: center;
  margin-top: 2rem;
}

.submit-btn {
  background: #3b82f6;
  color: white;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #2563eb;
}

.form-note {
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .service-request-form {
    padding: 1.5rem;
  }
}`
    },
    metadata: {
      author: 'Top Computers Web Team',
      lastModified: new Date().toISOString(),
      version: '1.1'
    },
    order: 5,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function seedServicesData() {
  try {
    console.log('Starting to seed services data...');
    
    for (const block of serviceBlocks) {
      const docRef = await addDoc(collection(db, 'serviceBlocks'), block);
      console.log(`Added service block: ${block.title} with ID: ${docRef.id}`);
    }
    
    console.log('✅ Services seed data added successfully!');
    console.log(`Added ${serviceBlocks.length} service blocks to the database.`);
    
  } catch (error) {
    console.error('❌ Error seeding services data:', error);
  }
}

// Run the seed function
seedServicesData();
