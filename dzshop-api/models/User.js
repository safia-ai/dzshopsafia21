import crypto from 'node:crypto'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' }
}, { timestamps: true })

userSchema.statics.hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

userSchema.statics.verifyPassword = (password, storedPassword) => {
  const [salt, storedHash] = storedPassword.split(':')
  if (!salt || !storedHash) return false

  const derivedHash = crypto.scryptSync(password, salt, 64)
  const expectedHash = Buffer.from(storedHash, 'hex')
  return expectedHash.length === derivedHash.length && crypto.timingSafeEqual(expectedHash, derivedHash)
}

const User = mongoose.model('User', userSchema)

export default User
