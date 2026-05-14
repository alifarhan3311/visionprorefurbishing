const Category = require('../models/Category');

// @desc    Create a new category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, tierLevel, parentCategory, navIconUrl, promoBannerUrl, highlightThumbnail } = req.body;
    
    const category = await Category.create({
      name,
      slug,
      tierLevel,
      parentCategory: tierLevel > 1 ? parentCategory : null,
      navIconUrl,
      promoBannerUrl,
      highlightThumbnail
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
    const allCategories = await Category.find({ status: 'active' }).lean();

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
    const categories = await Category.find().populate('parentCategory', 'name');
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

    const { name, slug, tierLevel, parentCategory, navIconUrl, promoBannerUrl, highlightThumbnail } = req.body;

    category = await Category.findByIdAndUpdate(req.params.id, {
      name,
      slug,
      tierLevel,
      parentCategory: tierLevel > 1 ? parentCategory : null,
      navIconUrl,
      promoBannerUrl,
      highlightThumbnail
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
