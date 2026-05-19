const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
require('dotenv').config();

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const buybackRoutes = require('./routes/buybackRoutes');
const rmaRoutes = require('./routes/rmaRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const heroSliderRoutes = require('./routes/heroSliderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares (OWASP Top 10)

// 1. Set security HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false })); // Allowed for cross-origin images

// 2. Prevent Cross-Site Request Forgery (CSRF) via CORS configuration
app.use(cors({
  origin: ['http://localhost:8083', 'http://localhost:5173', 'https://visionprorefurbishing.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 3. Body parser, reading data from body into req.body (with size limit against DOS attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

// 5. Data sanitization against Cross-Site Scripting (XSS)
app.use(xss());

// 6. Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: [
    'price', 'category', 'qty', 'rating' // Allow array of these parameters if needed
  ]
}));

// 7. Limit requests from same API (Rate Limiting to prevent Brute Force & DOS)
const limiter = rateLimit({
  max: 1000, // Allow 1000 requests from the same IP
  windowMs: 60 * 60 * 1000, // In 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 8. Stricter Rate Limiting for Authentication routes (Brute Force prevention)
const authLimiter = rateLimit({
  max: 20, // Only 20 login/signup attempts per hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many login attempts from this IP, please try again after an hour'
});
app.use('/api/v1/auth', authLimiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://alifarhan1531_db_user:azadar3311@cluster0.57zf8ot.mongodb.net/')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Previous Atlas URI kept for reference:
// mongodb+srv://alifarhan1531_db_user:azadar3311@cluster0.57zf8ot.mongodb.net/

// Mount Routes
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/buybacks', require('./routes/buybackRoutes'));
app.use('/api/v1/marketing', require('./routes/marketingRoutes'));
app.use('/api/v1/blog', require('./routes/blogRoutes'));
app.use('/api/v1/rmas', rmaRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/heroslider', heroSliderRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1/settings', require('./routes/settingsRoutes'));

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'MobileSentrix Backend API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on port ${PORT}`);
});

module.exports = app;
