const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrdersCount = await Order.countDocuments();
    const activeOrdersCount = await Order.countDocuments({ orderStatus: { $nin: ['Delivered', 'Cancelled'] } });
    
    const totalUsersCount = await User.countDocuments({ role: 'user' });
    const totalProductsCount = await Product.countDocuments();
    
    const criticalStockCount = await Product.countDocuments({ stockQuantity: { $lt: 10 } });
    
    // Calculate gross revenue
    const orders = await Order.find({ isPaid: true });
    const grossRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Get recent activity (last 5 orders)
    const recentActivity = await Order.find({})
      .populate('user', 'name companyName')
      .sort('-createdAt')
      .limit(5);

    const formattedActivity = recentActivity.map(order => ({
      id: order._id,
      company: order.user?.companyName || order.user?.name || 'Guest',
      type: 'Order',
      amount: order.totalPrice,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          grossRevenue,
          partnerNetwork: totalUsersCount,
          activeOrders: activeOrdersCount,
          totalOrders: totalOrdersCount,
          criticalStock: criticalStockCount,
          totalProducts: totalProductsCount
        },
        recentActivity: formattedActivity
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
