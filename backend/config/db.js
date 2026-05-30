import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';

const seedDatabase = async () => {
  try {
    // 1. Seed default Admin from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const adminUser = new User({
          name: 'Henco Admin',
          email: adminEmail,
          password: adminPassword, // Will be auto-hashed by model pre-save hook
          role: 'superadmin',
        });
        await adminUser.save();
        console.log(`✔ Default admin user seeded successfully: ${adminEmail}`);
      }
    } else {
      console.warn('⚠ WARNING: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are missing. Default admin user seeding skipped.');
    }

    // 2. Seed Default Categories
    const defaultCategories = [
      { name: 'Interlocking Bricks', slug: 'interlocking-bricks', description: 'High-strength structural interlocking blocks' },
      { name: 'Paving Blocks', slug: 'paving-blocks', description: 'Designer and heavy-duty concrete pavers for pathways and driveways' },
      { name: 'Floor Tiles', slug: 'floor-tiles', description: 'Premium non-slip exterior and patio tiles' },
      { name: 'Kerbstones', slug: 'kerbstones', description: 'Robust edge stones and roadside concrete kerbs' },
      { name: 'Garden & Landscaping Products', slug: 'garden-landscaping-products', description: 'Garden pavers, grass grids, and stepping stones' },
      { name: 'Custom Products', slug: 'custom-products', description: 'Custom-molded concrete architectural products' }
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`✔ Category seeded: ${cat.name}`);
      }
    }

    // 3. Seed Default Settings
    const settingsExists = await Settings.findOne({});
    if (!settingsExists) {
      await Settings.create({});
      console.log('✔ Default site settings initialized');
    }

    // 4. Self-Healing Migration: Ensure all Product categories are ObjectIds
    const products = await mongoose.connection.db.collection('products').find().toArray();
    for (const prod of products) {
      if (prod.category && typeof prod.category === 'string') {
        try {
          const objectIdCategory = new mongoose.Types.ObjectId(prod.category);
          await mongoose.connection.db.collection('products').updateOne(
            { _id: prod._id },
            { $set: { category: objectIdCategory } }
          );
          console.log(`✔ Migrated product "${prod.name}" category reference to native ObjectId`);
        } catch (err) {
          console.error(`❌ Failed to migrate product "${prod.name}" category:`, err.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✔ MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
