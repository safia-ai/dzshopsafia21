import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import User from './models/User.js'

const backendDirectory = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(backendDirectory, '.env') })

async function setPassword() {
  const mongoUri = process.env.MONGO_URI_DIRECT?.trim() || process.env.MONGO_URI?.trim()
  const email = process.env.SET_PASSWORD_EMAIL?.trim().toLowerCase()
  const password = process.env.SET_PASSWORD

  try {
    if (!mongoUri || !email || !password) {
      throw new Error('Configure MONGO_URI, SET_PASSWORD_EMAIL and SET_PASSWORD in dzshop-api/.env.')
    }
    if (password.length < 12) {
      throw new Error('SET_PASSWORD must contain at least 12 characters.')
    }

    await mongoose.connect(mongoUri)
    const result = await User.updateOne(
      { email },
      { $set: { password: User.hashPassword(password) } }
    )
    if (result.matchedCount === 0) throw new Error('User not found.')

    console.log(`Password updated for ${email}. The password was not displayed.`)
  } catch (error) {
    console.error('Password update failed:', error.message)
    process.exitCode = 1
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  }
}

setPassword()