const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/visionprorefurbishing';
const args = process.argv.slice(2);
const actionArg = args.find(arg => arg.startsWith('--action='));
const action = actionArg ? actionArg.split('=')[1] : 'report';

const connectDb = async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const ensureCategory = async (categoryId) => {
  if (!categoryId) return null;
  return Category.findById(categoryId);
};

const migrate = async () => {
  await connectDb();
  console.log(`Connected to MongoDB and starting Tier 4 migration in '${action}' mode.`);

  const tier4Categories = await Category.find({ tierLevel: 4 });
  if (!tier4Categories.length) {
    console.log('No Tier 4 categories found. Nothing to migrate.');
    return;
  }

  for (const cat of tier4Categories) {
    const childCount = await Category.countDocuments({ parentCategory: cat._id });
    if (childCount > 0) {
      console.log(`Skipping ${cat.name} (${cat._id}) because it has child categories.`);
      continue;
    }

    const products = await Product.find({ category: cat._id });
    const parent = await ensureCategory(cat.parentCategory);

    if (action === 'report') {
      console.log(`Candidate: ${cat.name} (${cat._id}) | isSubTier=${cat.isSubTier} | childCount=${childCount} | products=${products.length} | parentTier=${parent?.tierLevel || 'n/a'}`);
      continue;
    }

    if (action === 'convert') {
      if (cat.isSubTier === false) {
        cat.isSubTier = true;
        await cat.save();
        console.log(`Converted existing non-sub-tier Tier 4 category ${cat.name} to sub-tier.`);
      } else if (cat.isSubTier === undefined) {
        cat.isSubTier = true;
        await cat.save();
        console.log(`Normalized missing isSubTier on ${cat.name} to true.`);
      } else {
        console.log(`No action required for ${cat.name} (already sub-tier).`);
      }
      continue;
    }

    if (action === 'delete') {
      if (!parent) {
        console.log(`Cannot delete ${cat.name} because its parent category is missing.`);
        continue;
      }

      if (products.length > 0) {
        for (const product of products) {
          product.category = parent._id;
          await product.save();
          console.log(`Reassigned product ${product.sku} to parent category ${parent.name}.`);
        }
      }

      await cat.deleteOne();
      console.log(`Deleted empty Tier 4 placeholder category ${cat.name}.`);
      continue;
    }

    console.log(`Unknown action '${action}'. Use --action=report, --action=convert, or --action=delete.`);
    return;
  }
};

migrate()
  .then(() => {
    console.log('Tier 4 migration completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
