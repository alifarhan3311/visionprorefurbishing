const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

const fixProductImageUrl = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for imageUrl fix seed...');

    const products = await Product.find({
      images: { $exists: true, $ne: [] }
    });

    let updatedCount = 0;

    for (const product of products) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (firstImage && product.imageUrl !== firstImage) {
          product.imageUrl = firstImage;
          await product.save();
          updatedCount++;
          console.log(`Updated product ${product._id} imageUrl -> ${firstImage}`);
        }
      }
    }

    console.log(`ImageUrl fix complete. Updated ${updatedCount} product(s).`);
  } catch (error) {
    console.error('Failed to run imageUrl fix seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixProductImageUrl();
