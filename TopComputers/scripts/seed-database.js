import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import seedData from '../seed-data.json';

// Firebase config - update with your credentials
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    if (!categoriesSnapshot.empty) {
      console.log('📊 Database already contains data. Skipping seed...');
      return;
    }

    // Seed categories
    console.log('📁 Seeding categories...');
    const categoryPromises = seedData.categories.map(async (category) => {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { ...category, id: docRef.id };
    });
    const createdCategories = await Promise.all(categoryPromises);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed brands  
    console.log('🏷️ Seeding brands...');
    const brandPromises = seedData.brands.map(async (brand) => {
      const docRef = await addDoc(collection(db, 'brands'), {
        ...brand,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { ...brand, id: docRef.id };
    });
    const createdBrands = await Promise.all(brandPromises);
    console.log(`✅ Created ${createdBrands.length} brands`);

    // Map category and brand slugs to IDs
    const categoryMap = new Map(createdCategories.map(cat => [cat.slug, cat.id]));
    const brandMap = new Map(createdBrands.map(brand => [brand.slug, brand.id]));

    // Seed products
    console.log('📦 Seeding products...');
    const productPromises = seedData.products.map(async (product) => {
      const categoryId = categoryMap.get(product.categoryId);
      const brandId = brandMap.get(product.brandId);
      
      if (!categoryId || !brandId) {
        console.warn(`⚠️ Skipping product ${product.title} - missing category or brand`);
        return null;
      }

      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        categoryId,
        brandId,
        // Use placeholder images for demo
        images: product.images.map(() => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop'),
        thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { ...product, id: docRef.id };
    });
    
    const createdProducts = (await Promise.all(productPromises)).filter(Boolean);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:
    - Categories: ${createdCategories.length}
    - Brands: ${createdBrands.length}  
    - Products: ${createdProducts.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeder
seedDatabase();
