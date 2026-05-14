const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany({});

    // Create Admin
    await User.create({
      name: 'Admin VisionPro',
      email: 'admin@visionpro.com',
      password: 'admin123',
      role: 'admin',
      isAdmin: true,
      businessName: 'VisionPro Corporate',
      isApproved: true
    });

    // Create B2B Customer
    await User.create({
      name: 'John Dealer',
      email: 'dealer@example.com',
      password: 'b2b123',
      role: 'user',
      isAdmin: false,
      businessName: 'Johns Repair Shop',
      isApproved: true
    });

    console.log('Users seeded successfully!');
    console.log('Admin: admin@visionpro.com / admin123');
    console.log('B2B Customer: dealer@example.com / b2b123');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
