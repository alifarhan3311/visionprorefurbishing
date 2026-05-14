const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrders, getOrderInvoice, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/invoice').get(protect, getOrderInvoice);

module.exports = router;
