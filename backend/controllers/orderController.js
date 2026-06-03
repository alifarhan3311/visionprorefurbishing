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
        isPaid: ['Credit Card', 'Clover'].includes(paymentMethod) ? true : (isPaid || false),
        paidAt: ['Credit Card', 'Clover'].includes(paymentMethod) ? Date.now() : paidAt
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
      <td style="padding:10px; border-bottom:1px solid #e2e8f0;">
        ${item.name}
      </td>
      <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">
        ${item.qty}
      </td>
      <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;">
        $${Number(item.price).toFixed(2)}
      </td>
      <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;">
        $${(Number(item.qty) * Number(item.price)).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e5e7eb; padding:20px;">

      <h2 style="margin:0; color:#111827;">
        VisionPro Refurbishing
      </h2>

      <p style="color:#6b7280;">
        Order Confirmation
      </p>

      <hr>

      <p>Dear ${req.user.name || 'Customer'},</p>

      <p>
        Thank you for your order. Your order has been successfully placed.
      </p>

      <p>
        <strong>Order ID:</strong> ${createdOrder._id}
      </p>

      <h4>Shipping Details</h4>
      <p>
        ${shippingAddress.address}<br>
        ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
        ${shippingAddress.country}<br>
        Payment: ${paymentMethod}
      </p>

      <h4>Order Items</h4>

      <table width="100%" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="center">Qty</th>
            <th align="right">Price</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <hr>

      <p style="text-align:right;">
        Subtotal: <strong>$${Number(itemsPrice).toFixed(2)}</strong><br>
        Shipping: <strong>$${Number(shippingPrice).toFixed(2)}</strong><br>
        Tax: <strong>$${Number(taxPrice).toFixed(2)}</strong><br>
        <strong>Total: $${Number(totalPrice).toFixed(2)}</strong>
      </p>

      <hr>

      <p style="font-size:12px; color:#6b7280; text-align:center;">
        This email was sent to ${recipientEmail}.<br>
        If you did not place this order, contact support immediately.
      </p>

      <p style="font-size:12px; color:#9ca3af; text-align:center;">
        © 2026 VisionPro Refurbishing
      </p>

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
        await sendSMS(recipientPhone, `MobileSentrix: Order #${createdOrder._id} placed successfully. Total: $${Number(createdOrder.totalPrice).toFixed(2)}`);
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
