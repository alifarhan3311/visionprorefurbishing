const Product = require('../models/Product');

// @desc    Create a new product (Polymorphic Handler)
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, baseRetailPrice, category: categoryId, productType, ...dynamicFields } = req.body;
    const isSubTier = req.body.isSubTier !== undefined ? req.body.isSubTier !== 'false' && req.body.isSubTier !== false : true;

    if (req.body.isSubTier !== undefined && !isSubTier) {
      const Category = require('../models/Category');
      const parentCategory = await Category.findById(categoryId);
      if (!parentCategory) {
        return res.status(400).json({ success: false, error: 'Product category not found.' });
      }
      if (parentCategory.tierLevel !== 3) {
        return res.status(400).json({
          success: false,
          error: 'Direct products created from the Tier 4 form must be linked to a Tier 3 category.'
        });
      }
    }

    let imageUrl = dynamicFields.imageUrl || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Handle multiple images (image0..image3)
    const images = [];
    for (let i = 0; i < 4; i++) {
      const field = `image${i}`;
      if (req.files && req.files[field] && req.files[field][0]) {
        images.push(`/uploads/${req.files[field][0].filename}`);
      } else if (dynamicFields[`existingImage${i}`]) {
        images.push(dynamicFields[`existingImage${i}`]);
      }
    }
    // primary imageUrl = first uploaded image or existing
    if (images.length > 0 && !imageUrl) imageUrl = images[0];

    const stockQuantity = dynamicFields.stockQuantity !== undefined ? Number(dynamicFields.stockQuantity) : 10;
    const newProductData = {
      name,
      sku,
      baseRetailPrice,
      category: categoryId,
      productType,
      imageUrl,
      images,
      badge: dynamicFields.badge,
      features: dynamicFields.features || [],
      stockQuantity: Number.isNaN(stockQuantity) ? 10 : stockQuantity,
      status: stockQuantity === 0 ? 'out_of_stock' : 'in_stock'
    };

    // Handle Dynamic Polymorphic Fields Based on Type
    if (productType === 'preowned') {
      newProductData.preOwnedDetails = {
        imei: dynamicFields.imei,
        grade: dynamicFields.grade,
        batteryHealth: dynamicFields.batteryHealth,
        storage: dynamicFields.storage,
        carrierStatus: dynamicFields.carrierStatus
      };
    } else if (productType === 'components') {
      newProductData.componentDetails = {
        minimumOrderQuantity: dynamicFields.minimumOrderQuantity || 1,
        bulkTierPrice: dynamicFields.bulkTierPrice
      };
    } else if (productType === 'parts') {
      newProductData.partDetails = {
        qualityType: dynamicFields.qualityType,
        warrantyPeriod: dynamicFields.warrantyPeriod
      };
    }

    const product = await Product.create(newProductData);
    res.status(201).json({ success: true, data: product });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all products (with optional B2B Tier Pricing simulation)
// @route   GET /api/v1/products
// @access  Public (Pricing alters based on auth token in reality)
exports.getProducts = async (req, res) => {
  try {
    const { category, type } = req.query;
    
    // Build filter
    const query = { status: 'in_stock' };
    
    if (category) {
      // Check if category is an ObjectId or a slug
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await require('../models/Category').findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        } else {
          return res.status(200).json({ success: true, count: 0, data: [] });
        }
      }
    }
    
    if (type) query.productType = type;

    const products = await Product.find(query).populate('category', 'name slug');

    // B2B Tier Pricing based on authenticated user's tier
    const userTier = req.user?.tier || 'Tier 1';

    const modifiedProducts = products.map(product => {
      let finalPrice = product.baseRetailPrice;
      
      if (userTier === 'Tier 4') {
        finalPrice = finalPrice * 0.80; // 20% off
      } else if (userTier === 'Tier 3') {
        finalPrice = finalPrice * 0.85; // 15% off
      } else if (userTier === 'Tier 2') {
        finalPrice = finalPrice * 0.90; // 10% off
      }

      return {
        ...product._doc,
        b2bPrice: finalPrice.toFixed(2),
        retailPrice: product.baseRetailPrice.toFixed(2)
      };
    });

    res.status(200).json({ success: true, count: modifiedProducts.length, data: modifiedProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error fetching products' });
  }
};

// @desc    Validate multiple SKUs
// @route   POST /api/v1/products/validate-skus
// @access  Public
exports.validateSKUs = async (req, res) => {
  try {
    const { skus } = req.body;
    if (!skus || !Array.isArray(skus)) {
      return res.status(400).json({ success: false, error: 'SKUs must be an array' });
    }

    const products = await Product.find({ sku: { $in: skus } });
    
    const resultMap = {};
    products.forEach(p => {
      resultMap[p.sku] = {
        _id: p._id,
        name: p.name,
        price: p.baseRetailPrice
      };
    });

    res.status(200).json({ success: true, data: resultMap });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const { name, sku, baseRetailPrice, category, productType, ...dynamicFields } = req.body;

    let imageUrl = dynamicFields.imageUrl || product.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Handle multiple images (image0..image3)
    const images = [];
    for (let i = 0; i < 4; i++) {
      const field = `image${i}`;
      if (req.files && req.files[field] && req.files[field][0]) {
        images.push(`/uploads/${req.files[field][0].filename}`);
      } else if (dynamicFields[`existingImage${i}`]) {
        images.push(dynamicFields[`existingImage${i}`]);
      }
    }
    // Keep existing images if none uploaded
    const finalImages = images.length > 0 ? images : (product.images || []);
    if (finalImages.length > 0 && !imageUrl) imageUrl = finalImages[0];

    const updateData = {
      name,
      sku,
      baseRetailPrice,
      category,
      productType,
      imageUrl,
      images: finalImages,
      badge: dynamicFields.badge,
      features: dynamicFields.features || []
    };

    // Handle Dynamic Polymorphic Fields
    if (productType === 'preowned') {
      updateData.preOwnedDetails = {
        imei: dynamicFields.imei,
        grade: dynamicFields.grade,
        batteryHealth: dynamicFields.batteryHealth,
        storage: dynamicFields.storage,
        carrierStatus: dynamicFields.carrierStatus
      };
    } else if (productType === 'components') {
      updateData.componentDetails = {
        minimumOrderQuantity: dynamicFields.minimumOrderQuantity || 1,
        bulkTierPrice: dynamicFields.bulkTierPrice
      };
    } else if (productType === 'parts') {
      updateData.partDetails = {
        qualityType: dynamicFields.qualityType,
        warrantyPeriod: dynamicFields.warrantyPeriod
      };
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
