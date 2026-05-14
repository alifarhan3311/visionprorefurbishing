const Product = require('../models/Product');

// @desc    Create a new product (Polymorphic Handler)
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, baseRetailPrice, category, productType, ...dynamicFields } = req.body;

    const newProductData = {
      name,
      sku,
      baseRetailPrice,
      category,
      productType,
      imageUrl: dynamicFields.imageUrl,
      badge: dynamicFields.badge
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

    // Simulate B2B Tier Pricing logic
    // In production, this reads req.user.tierLevel
    const mockUserTier = req.headers['x-b2b-tier'] || 'Retail'; 

    const modifiedProducts = products.map(product => {
      let finalPrice = product.baseRetailPrice;
      
      if (mockUserTier === 'Gold') {
        finalPrice = finalPrice * 0.85; // 15% off
      } else if (mockUserTier === 'Silver') {
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

    const updateData = {
      name,
      sku,
      baseRetailPrice,
      category,
      productType,
      imageUrl: dynamicFields.imageUrl,
      badge: dynamicFields.badge
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
