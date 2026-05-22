const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const RMA = require('./models/RMA');
const Buyback = require('./models/Buyback');
const Appointment = require('./models/Appointment');
const BlogPost = require('./models/BlogPost');
const MarketingAsset = require('./models/MarketingAsset');
const Settings = require('./models/Settings');
const BuybackPricing = require('./models/BuybackPricing');
const HeroSlider = require('./models/HeroSlider');

const seedFullDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Full Seed...');

    // Clear existing data (except Users and Categories which we assume exist)
    await Product.deleteMany({});
    await Order.deleteMany({});
    await RMA.deleteMany({});
    await Buyback.deleteMany({});
    await Appointment.deleteMany({});
    await BlogPost.deleteMany({});
    await MarketingAsset.deleteMany({});
    await Settings.deleteMany({});
    await BuybackPricing.deleteMany({});
    await HeroSlider.deleteMany({});
    console.log('Cleared old operational data.');

    // 1. Get Users
    const admin = await User.findOne({ email: 'admin@visionpro.com' });
    const dealer = await User.findOne({ email: 'dealer@example.com' });

    if (!admin || !dealer) {
      console.log('Users not found. Please run seedUsers.js first.');
      process.exit(1);
    }

    // 2. Get Categories
    const ip15pmCat = await Category.findOne({ slug: 'ip15pm' });
    const jbcCat = await Category.findOne({ slug: 'jbc' });
    
    if (!ip15pmCat || !jbcCat) {
      console.log('Categories not found. Please run seedCategories.js first.');
      process.exit(1);
    }

    // 3. Seed Products
    const products = await Product.create([
      {
        name: 'iPhone 15 Pro Max OLED Assembly (Premium)',
        sku: 'IP15PM-OLED-PRM',
        baseRetailPrice: 249.99,
        category: ip15pmCat._id,
        productType: 'parts',
        partDetails: {
          qualityType: 'Premium Aftermarket',
          warrantyPeriod: 'Lifetime'
        },
        status: 'in_stock',
        imageUrl: 'https://images.unsplash.com/photo-1591337676887-a21bfc42d103?auto=format&fit=crop&q=80&w=400',
        badge: 'Hot Seller'
      },
      {
        name: 'JBC CD-1BQF Precision Soldering Station',
        sku: 'JBC-CD1BQF',
        baseRetailPrice: 499.00,
        category: jbcCat._id,
        productType: 'components',
        componentDetails: {
          minimumOrderQuantity: 1,
          bulkTierPrice: 450.00
        },
        status: 'in_stock',
        imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4f3915ce113?auto=format&fit=crop&q=80&w=400',
        badge: 'Genuine'
      }
    ]);

    // 4. Seed Orders
    await Order.create({
      user: dealer._id,
      orderItems: [
        {
          name: products[0].name,
          qty: 5,
          image: products[0].imageUrl,
          price: products[0].baseRetailPrice * 0.9, // Bulk discount
          product: products[0]._id
        }
      ],
      shippingAddress: {
        address: '123 Dealer Ave',
        city: 'Toronto',
        postalCode: 'M5V 2H1',
        country: 'Canada'
      },
      paymentMethod: 'Store Credit / Invoice',
      itemsPrice: 1124.95,
      taxPrice: 146.24,
      shippingPrice: 0.0,
      totalPrice: 1271.19,
      isPaid: false,
      isDelivered: false
    });

    // 5. Seed RMA
    await RMA.create({
      user: dealer._id,
      userId: dealer._id.toString(),
      searchMethod: 'Order ID',
      searchValue: 'ORD-894231',
      itemDetails: 'iPhone 14 Pro Screen - Dead Pixels',
      reason: 'Defective Product',
      description: 'Customer returned phone after 2 days claiming a green line appeared on the screen. No physical damage.',
      status: 'Pending'
    });

    // 6. Seed Buyback
    await Buyback.create({
      user: dealer._id,
      screens: [
        { brand: 'Apple', model: 'iPhone 13', condition: 'Broken Glass', qty: 10 },
        { brand: 'Apple', model: 'iPhone 12', condition: 'Broken Glass', qty: 5 }
      ],
      estimatedValue: 185.00,
      phone: '(416) 555-0192',
      status: 'Pending'
    });

    // 7. Seed Appointment
    await Appointment.create({
      user: dealer._id,
      fullName: dealer.name,
      email: dealer.email,
      phone: '(416) 555-0192',
      serviceType: 'B2B Micro-Soldering Repair',
      date: '2026-05-20',
      time: '10:00 AM',
      notes: 'Need 5 logic boards repaired for FaceID issue. Dropping off in morning.',
      status: 'Scheduled'
    });

    // 8. Seed Blog
    await BlogPost.create({
      title: 'The Evolution of Right to Repair in Canada',
      slug: 'evolution-of-right-to-repair',
      excerpt: 'How new legislation is opening up the repair industry for independent shops across North America.',
      content: '<p>Independent repair shops are seeing a massive boost in support...</p>',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
      category: 'Industry News',
      author: 'Admin VisionPro',
      status: 'published'
    });

    // 9. Seed Marketing Asset
    await MarketingAsset.create({
      title: 'VisionPro Wholesale Price List - May 2026',
      description: 'Complete breakdown of Tier 1 to Tier 3 pricing for all Apple and Samsung parts.',
      category: 'Price Lists',
      fileUrl: '/downloads/VisionPro-Price-List.pdf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      status: 'active'
    });

    // 10. Seed Settings
    await Settings.create({
      siteName: 'VisionPro B2B Refurbishing',
      contactEmail: 'wholesale@visionpro.com',
      currency: 'CAD',
      maintenanceMode: false,
      freeShippingThreshold: 500,
       taxRate: 8,
      footerText: '© 2026 VisionPro Refurbishing. Authorized Wholesale Portal.',
      apiCache: true,
      twoFactor: false
    });
    // 11. Seed Buyback Pricing
    await BuybackPricing.create([
      {
        brand: 'Apple',
        model: 'iPhone 13',
        conditions: [
          { grade: 'Grade A (Flawless)', price: 35.00 },
          { grade: 'Grade B (Minor Scratches)', price: 25.00 },
          { grade: 'Grade C (Heavy Wear)', price: 15.00 }
        ]
      },
      {
        brand: 'Apple',
        model: 'iPhone 12',
        conditions: [
          { grade: 'Grade A (Flawless)', price: 25.00 },
          { grade: 'Grade B (Minor Scratches)', price: 18.00 },
          { grade: 'Grade C (Heavy Wear)', price: 10.00 }
        ]
      }
    ]);
    // 12. Seed Hero Slides
    await HeroSlider.create([
      {
        title: 'Premium B2B Parts & Devices',
        subtitle: 'Wholesale pricing on Apple, Samsung, and more. Register to unlock tier discounts.',
        imageUrl: 'https://images.unsplash.com/photo-1591337676887-a21bfc42d103?auto=format&fit=crop&q=80&w=1920',
        linkUrl: '/shop',
        order: 1,
        isActive: true
      },
      {
        title: 'Industry-Leading Micro-Soldering Tools',
        subtitle: 'Premium JBC and QianLi equipment for professional refurbishment shops.',
        imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4f3915ce113?auto=format&fit=crop&q=80&w=1920',
        linkUrl: '/shop',
        order: 2,
        isActive: true
      }
    ]);

    console.log('✅ Success: All operational data has been seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedFullDB();
