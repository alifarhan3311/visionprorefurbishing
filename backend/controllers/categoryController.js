const Category = require('../models/Category');

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() !== 'false';
  if (value === undefined || value === null) return true;
  return Boolean(value);
};

// Sanitize slugs: replace any character that breaks URL routing with a hyphen
const sanitizeSlug = (slug) => {
  if (!slug) return slug;
  return slug
    .toLowerCase()
    .trim()
    .replace(/[\/\\]/g, '-')       // forward/back slashes → hyphen
    .replace(/[()[\]{}'",;:!@#$%^&*+=<>?|`~]/g, '') // remove special chars
    .replace(/\s+/g, '-')          // spaces → hyphen
    .replace(/-{2,}/g, '-')        // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');      // trim leading/trailing hyphens
};

const validateParentCategory = async (tierLevel, parentCategoryId) => {
  if (tierLevel <= 1) return null;
  if (!parentCategoryId) {
    throw new Error(`Tier ${tierLevel} categories must be assigned a Tier ${tierLevel - 1} parent category.`);
  }

  const parentCategory = await Category.findById(parentCategoryId);
  if (!parentCategory) {
    throw new Error('Parent category not found.');
  }

  if (parentCategory.tierLevel !== tierLevel - 1) {
    throw new Error(`Parent category must belong to Tier ${tierLevel - 1}.`);
  }

  return parentCategory;
};

// @desc    Create a new category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, tierLevel, parentCategory, highlightThumbnail } = req.body;
    const tierNumber = parseInt(tierLevel, 10);
    const isSubTier = parseBoolean(req.body.isSubTier);

    if (tierNumber === 4 && !isSubTier) {
      return res.status(400).json({
        success: false,
        error: 'Tier 4 must be a sub-tier; to add a product directly under Tier 3, leave "Is Sub-Tier" unchecked and create a product instead.'
      });
    }

    const parentCategoryRecord = await validateParentCategory(tierNumber, parentCategory);

    let navIconUrl = req.body.navIconUrl || '';
    let promoBannerUrl = req.body.promoBannerUrl || '';

    if (req.files) {
      if (req.files.icon && req.files.icon[0]) {
        navIconUrl = `/uploads/${req.files.icon[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        promoBannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    let parsedTopProducts = [];
    if (req.body.topProducts) {
      try {
        parsedTopProducts = JSON.parse(req.body.topProducts);
      } catch (e) {
        parsedTopProducts = [];
      }
    }

    const category = await Category.create({
      name,
      slug: sanitizeSlug(slug),
      tierLevel: tierNumber,
      isSubTier,
      parentCategory: tierNumber > 1 ? parentCategoryRecord._id : null,
      navIconUrl,
      promoBannerUrl,
      highlightThumbnail,
      topProducts: parsedTopProducts
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get the complete 4-Tier Mega Menu tree
// @route   GET /api/categories/mega-menu
// @access  Public
exports.getMegaMenu = async (req, res) => {
  try {
    // 1. Fetch ALL active categories in a single query (Fastest approach)
    const allCategories = await Category.find({
      status: 'active',
      $or: [
        { tierLevel: { $ne: 4 } },
        { isSubTier: true }
      ]
    })
      .populate({
        path: 'topProducts',
        match: { status: 'in_stock' }
      })
      .lean();

    // 2. Build the tree using an O(N) mapping approach
    const categoryMap = {};
    const megaMenuTree = [];

    // Initialize map
    allCategories.forEach(cat => {
      cat.children = [];
      categoryMap[cat._id.toString()] = cat;
    });

    // Construct Tree
    allCategories.forEach(cat => {
      if (cat.parentCategory) {
        // If it has a parent, push to parent's children array
        const parentId = cat.parentCategory.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(cat);
        }
      } else {
        // If no parent (Tier 1), push to root tree
        megaMenuTree.push(cat);
      }
    });

    // 3. Optional: Sort the arrays by name or a custom order field here

    res.status(200).json({ success: true, data: megaMenuTree });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch Mega Menu' });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().select('name tierLevel parentCategory').lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const { name, slug, tierLevel, parentCategory, highlightThumbnail } = req.body;
    const tierNumber = parseInt(tierLevel, 10);
    const isSubTier = req.body.isSubTier === undefined ? category.isSubTier !== false : parseBoolean(req.body.isSubTier);

    if (tierNumber === 4 && !isSubTier) {
      return res.status(400).json({
        success: false,
        error: 'Tier 4 must be a sub-tier; to add a product directly under Tier 3, leave "Is Sub-Tier" unchecked and create a product instead.'
      });
    }

    const parentCategoryRecord = await validateParentCategory(tierNumber, parentCategory);

    let parsedTopProducts = category.topProducts || [];
    if (req.body.topProducts) {
      try {
        parsedTopProducts = JSON.parse(req.body.topProducts);
      } catch (e) {
        parsedTopProducts = category.topProducts || [];
      }
    }

    let navIconUrl = req.body.navIconUrl || category.navIconUrl;
    let promoBannerUrl = req.body.promoBannerUrl || category.promoBannerUrl;

    if (req.files) {
      if (req.files.icon && req.files.icon[0]) {
        navIconUrl = `/uploads/${req.files.icon[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        promoBannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, {
      name,
      slug: sanitizeSlug(slug),
      tierLevel: tierNumber,
      isSubTier,
      parentCategory: tierNumber > 1 ? parentCategoryRecord._id : null,
      navIconUrl,
      promoBannerUrl,
      highlightThumbnail,
      topProducts: parsedTopProducts
    }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
