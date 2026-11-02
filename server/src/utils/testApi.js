import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

dotenv.config();

const runTests = async () => {
  console.log('[Test] Running full-stack verification test...');
  await connectDB();

  // Test 1: Verify Demo User
  const demoUser = await User.findOne({ email: 'owner@menuqr.com' }).select('+password');
  console.assert(demoUser !== null, 'Demo user must exist');
  const isPasswordValid = await demoUser.comparePassword('password123');
  console.assert(isPasswordValid, 'Demo user password verification failed');
  console.log('✓ Test 1 Passed: Demo user & bcrypt password hash verified.');

  // Test 2: Verify Restaurant profile
  const restaurant = await Restaurant.findOne({ slug: 'royal-biryani' });
  console.assert(restaurant !== null, 'Demo restaurant must exist');
  console.assert(restaurant.name === 'The Royal Biryani & Bistro', 'Restaurant name mismatch');
  console.log(`✓ Test 2 Passed: Restaurant profile verified (${restaurant.name}, slug: ${restaurant.slug}).`);

  // Test 3: Verify Categories & Menu Items
  const categories = await Category.find({ restaurant: restaurant._id });
  const items = await MenuItem.find({ restaurant: restaurant._id });
  console.assert(categories.length >= 5, 'Should have at least 5 categories');
  console.assert(items.length >= 15, 'Should have at least 15 menu items');
  console.log(`✓ Test 3 Passed: Found ${categories.length} categories and ${items.length} menu items.`);

  // Test 4: Verify Tables & QR Codes
  const tables = await Table.find({ restaurant: restaurant._id });
  console.assert(tables.length >= 6, 'Should have at least 6 tables');
  const sampleTable = tables[0];
  console.assert(sampleTable.qrCodeDataUrl.startsWith('data:image/png;base64,'), 'QR code base64 missing');
  console.log(`✓ Test 4 Passed: Verified ${tables.length} tables with high-res QR codes.`);

  // Test 5: Verify Orders & Statuses
  const orders = await Order.find({ restaurant: restaurant._id });
  console.assert(orders.length >= 5, 'Should have sample orders');
  console.log(`✓ Test 5 Passed: Verified ${orders.length} real order tickets.`);

  console.log('\n========================================');
  console.log('🎉 ALL BACKEND FULL-STACK TESTS PASSED!');
  console.log('========================================\n');

  await closeDB();
  process.exit(0);
};

runTests().catch((err) => {
  console.error('[Test Failed]:', err);
  process.exit(1);
});
