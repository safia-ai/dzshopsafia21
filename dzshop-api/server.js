import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import User from './models/User.js'
import productRoutes, { vendorRouter } from './routes/products.js'
import orderRoutes from './routes/orders.js'
import userRoutes from './routes/users.js'
import { createToken, requireAuth } from './middleware/auth.js'

dotenv.config()

const app = express()
const googleClient = new OAuth2Client()

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Origin not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in the backend environment.')
}

const normalizeRole = (role) => {
  if (role === 'vendor') return 'vendor'
  return 'client'
}

async function ensureAdminUser() {
  const adminCount = await User.countDocuments({ role: 'admin' })
  if (adminCount > 0) return

  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const configuredAdminPassword = process.env.ADMIN_INITIAL_PASSWORD
  if (!configuredAdminEmail || !configuredAdminPassword) {
    console.warn('No initial admin bootstrap configured. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD only for first setup.')
    return
  }

  const existingAdmin = await User.findOne({ email: configuredAdminEmail })
  if (existingAdmin) return

  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email: configuredAdminEmail,
    password: User.hashPassword(configuredAdminPassword),
    role: 'admin'
  })
}

async function migrateLegacyRoles() {
  await User.updateMany({ role: { $nin: ['client', 'vendor', 'admin'] } }, { $set: { role: 'client' } })
}

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connecté ✅')
    await migrateLegacyRoles()
    await ensureAdminUser()
  })
  .catch((err) => console.log('Erreur MongoDB : ' + err.message))

app.get('/', (req, res) => {
  res.json({ message: 'API DZShop en ligne' })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !password || password.length < 6) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
  }

  try {
    const account = await User.findOne({ email: normalizedEmail }).select('+password')
    if (!account || !User.verifyPassword(password, account.password)) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
    }

    const user = {
      id: account._id,
      nom: account.name,
      name: account.name,
      email: account.email,
      role: account.role
    }

    return res.json({ user, token: createToken(user) })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { name, nom, email, password, role } = req.body
  const normalizedEmail = email?.trim().toLowerCase()

  if (!(name || nom)?.trim() || !normalizedEmail || !password || password.length < 6) {
    return res.status(400).json({ message: 'Informations d’inscription invalides.' })
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) return res.status(409).json({ message: 'Cette adresse email est déjà utilisée.' })

    const createdUser = await User.create({
      name: (name || nom).trim(),
      email: normalizedEmail,
      password: User.hashPassword(password),
      role: normalizeRole(role)
    })

    const user = {
      id: createdUser._id,
      nom: createdUser.name,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role
    }

    return res.status(201).json({ user, token: createToken(user) })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Cette adresse email est déjà utilisée.' })
    return res.status(400).json({ message: err.message })
  }
})

app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/vendor/products', vendorRouter)

app.get('/api/me', requireAuth, async (req, res) => {
  return res.json({ user: { id: req.user._id, email: req.user.email, role: req.user.role, name: req.user.name || req.user.nom } })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`)
})

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google Authentication est indisponible.' })
  }

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ message: 'Credential Google manquant.' })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Le compte Google doit fournir un email vérifié.' })
    }

    const normalizedEmail = payload.email.trim().toLowerCase()
    let account = await User.findOne({ googleId: payload.sub })

    if (!account) {
      account = await User.findOne({ email: normalizedEmail })
      if (account) {
        account.googleId = payload.sub
        await account.save()
      }
    }

    if (!account) {
      account = await User.create({
        name: payload.name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId: payload.sub,
        role: 'client'
      })
    }

    const user = {
      id: account._id,
      nom: account.name,
      name: account.name,
      email: account.email,
      role: account.role
    }

    return res.json({ user, token: createToken(user) })
  } catch {
    return res.status(401).json({ message: 'Credential Google invalide ou expiré.' })
  }
})