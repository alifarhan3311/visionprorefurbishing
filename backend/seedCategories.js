const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const seedMegaMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing
    await Category.deleteMany({});
    console.log('Cleared existing categories.');

    // --- TIER 1: Main Brands (Ordered as requested) ---
    const apple = await Category.create({ name: 'Apple Parts', slug: 'apple', tierLevel: 1 });
    const samsung = await Category.create({ name: 'Samsung Parts', slug: 'samsung', tierLevel: 1 });
    const motorola = await Category.create({ name: 'Motorola Parts', slug: 'motorola', tierLevel: 1 });
    const google = await Category.create({ name: 'Google Pixel', slug: 'google', tierLevel: 1 });
    const tools = await Category.create({ name: 'Tools & Equipment', slug: 'tools', tierLevel: 1 });
    const accessories = await Category.create({ name: 'Accessories', slug: 'accessories', tierLevel: 1 });
    const preowned = await Category.create({ name: 'Pre-Owned Devices', slug: 'preowned', tierLevel: 1 });
    const consoles = await Category.create({ name: 'Game Console', slug: 'consoles', tierLevel: 1 });
    const board = await Category.create({ name: 'Board Components', slug: 'board-parts', tierLevel: 1 });
    const other = await Category.create({ name: 'Other Parts', slug: 'other', tierLevel: 1 });

    // --- APPLE TIER 2 ---
    const iphone = await Category.create({ name: 'iPhone', slug: 'iphone', tierLevel: 2, parentCategory: apple._id });
    const ipad = await Category.create({ name: 'iPad', slug: 'ipad', tierLevel: 2, parentCategory: apple._id });
    const watch = await Category.create({ name: 'Apple Watch', slug: 'watch', tierLevel: 2, parentCategory: apple._id });
    const macbook = await Category.create({ name: 'MacBook', slug: 'macbook', tierLevel: 2, parentCategory: apple._id });

    // --- iPhone 15 Tier 3 & 4 ---
    const ip15 = await Category.create({ name: 'iPhone 15 Series', slug: 'iphone-15', tierLevel: 3, parentCategory: iphone._id });
    await Category.create({ name: 'iPhone 15 Pro Max', slug: 'ip15pm', tierLevel: 4, parentCategory: ip15._id });
    await Category.create({ name: 'iPhone 15 Pro', slug: 'ip15p', tierLevel: 4, parentCategory: ip15._id });
    await Category.create({ name: 'iPhone 15 Plus', slug: 'ip15plus', tierLevel: 4, parentCategory: ip15._id });
    await Category.create({ name: 'iPhone 15', slug: 'ip15', tierLevel: 4, parentCategory: ip15._id });

    // --- iPad Tier 3 & 4 ---
    const ipadPro = await Category.create({ name: 'iPad Pro', slug: 'ipad-pro', tierLevel: 3, parentCategory: ipad._id });
    await Category.create({ name: 'iPad Pro 12.9 (6th Gen)', slug: 'ipad-pro-12-9-6', tierLevel: 4, parentCategory: ipadPro._id });
    await Category.create({ name: 'iPad Pro 11 (4th Gen)', slug: 'ipad-pro-11-4', tierLevel: 4, parentCategory: ipadPro._id });

    // --- SAMSUNG TIER 2 ---
    const sSeries = await Category.create({ name: 'Galaxy S Series', slug: 's-series', tierLevel: 2, parentCategory: samsung._id });
    const nSeries = await Category.create({ name: 'Galaxy Note Series', slug: 'note-series', tierLevel: 2, parentCategory: samsung._id });
    const aSeries = await Category.create({ name: 'Galaxy A Series', slug: 'a-series', tierLevel: 2, parentCategory: samsung._id });

    // --- S24 Tier 3 & 4 ---
    const s24 = await Category.create({ name: 'Galaxy S24', slug: 's24-series', tierLevel: 3, parentCategory: sSeries._id });
    await Category.create({ name: 'S24 Ultra', slug: 's24u', tierLevel: 4, parentCategory: s24._id });
    await Category.create({ name: 'S24 Plus', slug: 's24plus', tierLevel: 4, parentCategory: s24._id });
    await Category.create({ name: 'S24', slug: 's24-base', tierLevel: 4, parentCategory: s24._id });

    // --- TOOLS TIER 2 & 3 ---
    const soldering = await Category.create({ name: 'Soldering', slug: 'soldering', tierLevel: 2, parentCategory: tools._id });
    const opening = await Category.create({ name: 'Opening Tools', slug: 'opening-tools', tierLevel: 2, parentCategory: tools._id });
    
    const stations = await Category.create({ name: 'Soldering Stations', slug: 'stations', tierLevel: 3, parentCategory: soldering._id });
    await Category.create({ name: 'JBC Stations', slug: 'jbc', tierLevel: 4, parentCategory: stations._id });
    await Category.create({ name: 'Quick Stations', slug: 'quick', tierLevel: 4, parentCategory: stations._id });

    // --- ACCESSORIES TIER 2 ---
    const cables = await Category.create({ name: 'Cables & Adapters', slug: 'cables', tierLevel: 2, parentCategory: accessories._id });
    const protection = await Category.create({ name: 'Screen Protection', slug: 'protection', tierLevel: 2, parentCategory: accessories._id });
    
    const lightning = await Category.create({ name: 'Lightning Cables', slug: 'lightning', tierLevel: 3, parentCategory: cables._id });
    await Category.create({ name: 'USB-C to Lightning', slug: 'c-to-l', tierLevel: 4, parentCategory: lightning._id });
    await Category.create({ name: 'USB-A to Lightning', slug: 'a-to-l', tierLevel: 4, parentCategory: lightning._id });

    // --- MOTOROLA TIER 2 & 3 ---
    const motoG = await Category.create({ name: 'Moto G Series', slug: 'moto-g', tierLevel: 2, parentCategory: motorola._id });
    await Category.create({ name: 'Moto G Stylus', slug: 'moto-g-stylus', tierLevel: 3, parentCategory: motoG._id });

    // --- GOOGLE TIER 2 & 3 ---
    const pixel8 = await Category.create({ name: 'Pixel 8 Series', slug: 'pixel-8', tierLevel: 2, parentCategory: google._id });
    await Category.create({ name: 'Pixel 8 Pro', slug: 'pixel-8-pro', tierLevel: 3, parentCategory: pixel8._id });

    // --- GAME CONSOLE TIER 2 & 3 ---
    const playstation = await Category.create({ name: 'PlayStation', slug: 'ps', tierLevel: 2, parentCategory: consoles._id });
    const xbox = await Category.create({ name: 'Xbox', slug: 'xbox', tierLevel: 2, parentCategory: consoles._id });
    await Category.create({ name: 'PS5 Parts', slug: 'ps5', tierLevel: 3, parentCategory: playstation._id });

    // --- BOARD COMPONENTS TIER 2 & 3 ---
    const ic = await Category.create({ name: 'IC Chips', slug: 'ic', tierLevel: 2, parentCategory: board._id });
    const connectors = await Category.create({ name: 'FPC Connectors', slug: 'connectors', tierLevel: 2, parentCategory: board._id });
    await Category.create({ name: 'Power ICs', slug: 'power-ic', tierLevel: 3, parentCategory: ic._id });

    console.log('Final Comprehensive Seed completed successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedMegaMenu();
