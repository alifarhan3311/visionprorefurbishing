const Order = require('../models/Order');
const generateInvoice = require('../utils/generateInvoice');
const sendEmail = require('../utils/sendEmail');

// @desc    Get order invoice (PDF)
// @route   GET /api/v1/orders/:id/invoice
// @access  Private
exports.getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email companyName');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check if the order belongs to the user or if user is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const fileName = `invoice_${order._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    generateInvoice(order, res);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const { sendSMS } = require('../utils/smsService');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ success: false, error: 'No order items' });
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      });

      const createdOrder = await order.save();

      // Deduct stock and check for depleted range
      for (const item of orderItems) {
        const product = await require('../models/Product').findById(item.product);
        if (product) {
          product.stockQuantity = product.stockQuantity - (item.qty || 1);
          await product.save();
          
          if (product.stockQuantity <= 5) { // Depleted range
            await require('../utils/sendEmail')({
              to: process.env.MAIL_FROM_ADDRESS || 'admin@visionpro.com',
              subject: `Stock Alert: ${product.name} is low`,
              html: `<p>Warning: Product <strong>${product.name}</strong> (SKU: ${product.sku}) is running low on stock.</p><p>Remaining Quantity: ${product.stockQuantity}</p>`
            });
          }
        }
      }

      // Send SMS Notification
      if (req.user.phone) {
        await sendSMS(req.user.phone, `MobileSentrix: Order #${createdOrder._id} placed successfully. Total: $${createdOrder.totalPrice.toFixed(2)}`);
      }

      res.status(201).json({ success: true, data: createdOrder });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/v1/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort('-createdAt');
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { status } = req.body;
    
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'Paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    order.orderStatus = status; // Assuming orderStatus field exists or using isDelivered/isPaid flags
    await order.save();

    // Send email notification to user
    if (order.user && order.user.email) {
      await sendEmail({
        to: order.user.email,
        subject: `Order Update: ${status}`,
        html: `<p>Hello ${order.user.name},</p><p>Your order (ID: ${order._id}) status has been updated to: <strong>${status}</strong>.</p>`
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
