/**
 * One-time migration: sanitize all category slugs that contain
 * forward slashes, parentheses, or other URL-breaking characters.
 *
 * Run with: node backend/scripts/fixSlugs.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const sanitizeSlug = (slug) => {
  if (!slug) return slug;
  return slug
    .toLowerCase()
    .trim()
    .replace(/[\/\\]/g, '-')
    .replace(/[()[\]{}'",;:!@#$%^&*+=<>?|`~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const categories = await Category.find({});
  let fixed = 0;

  for (const cat of categories) {
    const clean = sanitizeSlug(cat.slug);
    if (clean !== cat.slug) {
      console.log(`  Fixing: "${cat.slug}" → "${clean}"`);
      // Handle potential duplicate after sanitization
      let finalSlug = clean;
      const existing = await Category.findOne({ slug: clean, _id: { $ne: cat._id } });
      if (existing) {
        finalSlug = `${clean}-${cat._id.toString().slice(-4)}`;
        console.log(`    Duplicate detected, using: "${finalSlug}"`);
      }
      await Category.findByIdAndUpdate(cat._id, { slug: finalSlug });
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} slug(s) out of ${categories.length} categories.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
