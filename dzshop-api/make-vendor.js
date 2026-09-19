import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: node make-vendor.js <email>');
  process.exit(1);
}

try {
  await mongoose.connect(uri);
  const user = await mongoose.connection.collection('users').findOne({
    email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  });

  if (user) {
    console.log('Utilisateur trouvé :', user.email, '| Rôle actuel :', user.role);
    if (user.role !== 'vendor') {
      await mongoose.connection.collection('users').updateOne(
        { _id: user._id },
        { $set: { role: 'vendor' } }
      );
      console.log('=> Rôle mis à jour avec SUCCÈS en : vendor');
    }
  } else {
    console.log('Aucun utilisateur trouvé avec cet email.');
    const allUsers = await mongoose.connection.collection('users').find({}, { projection: { email: 1, role: 1 } }).toArray();
    console.log('Liste des emails en base :', allUsers);
  }
} catch (err) {
  console.error('Erreur:', err);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}