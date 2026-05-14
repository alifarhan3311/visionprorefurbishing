const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  getMyAppointments, 
  getAllAppointments, 
  updateAppointmentStatus 
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/', protect, admin, getAllAppointments);
router.put('/:id/status', protect, admin, updateAppointmentStatus);

module.exports = router;
