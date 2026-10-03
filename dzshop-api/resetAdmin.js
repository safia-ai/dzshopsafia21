import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import User from './models/User.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, '.env') });

async function setupAdmin() {
  const mongoUri = process.env.MONGO_URI_DIRECT?.trim() || process.env.MONGO_URI?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  try {
    if (!mongoUri) throw new Error('Configure MONGO_URI_DIRECT or MONGO_URI in dzshop-api/.env.');
    if (!adminEmail || !adminPassword) throw new Error('Configure ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD before resetting the admin account.');
    if (adminPassword.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (admin && admin.role !== 'admin') {
      throw new Error('The configured email belongs to a non-admin account; refusing to promote it.');
    }

    if (!admin) admin = new User({ email: adminEmail, role: 'admin' });
    admin.name = process.env.ADMIN_NAME?.trim() || 'Admin';
    admin.password = User.hashPassword(adminPassword);
    await admin.save();

    console.log(`Admin credentials updated for ${admin.email}. The password was not displayed.`);
  } catch (error) {
    console.error('Admin reset failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
}

setupAdmin();