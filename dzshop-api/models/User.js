import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false, select: false },
  googleId: { type: String, unique: true, sparse: true, trim: true },
  role: { type: String, enum: ['client', 'vendor', 'admin'], default: 'client' }
}, { timestamps: true })

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 12)
}

userSchema.statics.verifyPassword = (password, storedPassword) => {
  if (!storedPassword || typeof storedPassword !== 'string') return false
  return bcrypt.compareSync(password, storedPassword)
}

const User = mongoose.model('User', userSchema)

export default User
