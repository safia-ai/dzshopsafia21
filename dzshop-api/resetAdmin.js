import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from './models/User.js';

async function setupAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.\n');

    // 1. عرض الحسابات الموجودة مسبقاً
    const existingUsers = await User.find({}, 'email role name');
    console.log('--- Utilisateurs dans la base de données ---');
    console.log(existingUsers);
    console.log('-------------------------------------------\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dzshop.dz';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'SAFIA2005';
    const adminName = process.env.ADMIN_NAME || 'Admin Safia';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 2. تحديث الحساب أو إنشاؤه إذا لم يكن موجوداً (upsert)
    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Compte Admin prêt avec succès !');
    console.log(`Email    : ${admin.email}`);
    console.log(`Password : ${adminPassword}`);
    console.log(`Role     : ${admin.role}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

setupAdmin();