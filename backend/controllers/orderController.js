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
      totalPrice,
      isPaid,
      paidAt,
      email,
      phone
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
        totalPrice,
        isPaid: paymentMethod === 'Credit Card' ? true : (isPaid || false),
        paidAt: paymentMethod === 'Credit Card' ? Date.now() : paidAt
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

      // Send Order Confirmation Email to User
      const recipientEmail = email || (req.user && req.user.email);
      if (recipientEmail) {
        const itemsHtml = orderItems.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.qty}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(item.qty * item.price).toFixed(2)}</td>
          </tr>
        `).join('');

        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a; margin: 0;">VisionPro Refurbishing</h2>
              <p style="color: #64748b; margin: 5px 0 0 0;">Wholesale Order Confirmation</p>
            </div>
            
            <p>Dear ${req.user.name || 'Valued B2B Customer'},</p>
            <p>Thank you for your order! We are pleased to confirm that we have received your order <strong>#${createdOrder._id}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Shipping Details</h4>
              <p style="margin: 0; font-size: 14px; color: #475569;">
                <strong>Address:</strong> ${shippingAddress.address}<br>
                <strong>City/Postal Code:</strong> ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                <strong>Country:</strong> ${shippingAddress.country}<br>
                <strong>Payment Method:</strong> ${paymentMethod}
              </p>
            </div>

            <h4 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">Order Items</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left;">
                  <th style="padding: 10px; font-weight: 600; color: #475569;">Item</th>
                  <th style="padding: 10px; font-weight: 600; color: #475569; text-align: center;">Qty</th>
                  <th style="padding: 10px; font-weight: 600; color: #475569; text-align: right;">Price</th>
                  <th style="padding: 10px; font-weight: 600; color: #475569; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 20px; text-align: right; font-size: 14px;">
              <p style="margin: 5px 0;">Items Subtotal: <strong>$${itemsPrice.toFixed(2)}</strong></p>
              <p style="margin: 5px 0;">Shipping: <strong>$${shippingPrice.toFixed(2)}</strong></p>
              <p style="margin: 5px 0;">Tax (8%): <strong>$${taxPrice.toFixed(2)}</strong></p>
              <h3 style="margin: 10px 0 0 0; color: #1e3a8a; font-size: 18px;">Order Total: $${totalPrice.toFixed(2)}</h3>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">© 2026 VisionPro Refurbishing. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This email was sent to ${recipientEmail}. If you did not make this purchase, please contact support immediately.</p>
            </div>
          </div>
        `;

        await sendEmail({
          to: recipientEmail,
          subject: `VisionPro Order Confirmation - #${createdOrder._id}`,
          html: emailHtml
        });
      }

      // Send SMS Notification
      const recipientPhone = phone || req.user.phone;
      if (recipientPhone) {
        await sendSMS(recipientPhone, `MobileSentrix: Order #${createdOrder._id} placed successfully. Total: $${createdOrder.totalPrice.toFixed(2)}`);
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
