import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Order from './models/Order.js'
import User from './models/User.js'
import productRoutes, { vendorRouter } from './routes/products.js'
import { createToken, requireAuth, requireAdmin } from './middleware/auth.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté ✅'))
  .catch((err) => console.log('Erreur MongoDB : ' + err.message))

// المسار الرئيسي
app.get('/', (req, res) => {
  res.json({ message: 'API DZShop en ligne' })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !password || password.length < 6) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
  }

  User.findOne({ email: normalizedEmail }).select('+password')
    .then(async (account) => {
      let userAccount = account

      // Preserve the existing demo admin account while storing it in MongoDB.
      if (!userAccount && normalizedEmail === 'admin@dzshop.dz' && password === '123456') {
        userAccount = await User.create({
          name: 'Admin',
          email: normalizedEmail,
          password: User.hashPassword(password),
          role: 'admin'
        })
      }

      if (!userAccount || !User.verifyPassword(password, userAccount.password)) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })
      }

      const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
      const configuredAdminName = (process.env.ADMIN_NAME || 'Beckham').trim().toLowerCase()
      const isConfiguredAdmin = normalizedEmail === configuredAdminEmail
        || userAccount.name.trim().toLowerCase() === configuredAdminName

      if (isConfiguredAdmin && userAccount.role !== 'admin') {
        userAccount.role = 'admin'
        await userAccount.save()
      }

      const user = { id: userAccount._id, nom: userAccount.name, name: userAccount.name, email: userAccount.email, role: userAccount.role }
      return res.json({ user, token: createToken(user) })
    })
    .catch((err) => res.status(500).json({ message: err.message }))
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
      role: role === 'vendor' ? 'vendor' : 'user'
    })
    const user = { id: createdUser._id, nom: createdUser.name, name: createdUser.name, email: createdUser.email, role: createdUser.role }
    return res.status(201).json({ user, token: createToken(user) })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Cette adresse email est déjà utilisée.' })
    return res.status(400).json({ message: err.message })
  }
})

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress, totalPrice } = req.body
    if (!Array.isArray(items) || items.length === 0 || !shippingAddress || totalPrice === undefined) {
      return res.status(400).json({ message: 'Données de commande incomplètes.' })
    }

    const order = await Order.create({
      userId: req.user.sub,
      items,
      shippingAddress,
      totalPrice,
      status: 'En attente'
    })

    return res.status(201).json(order)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.json(orders)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

app.patch('/api/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowedStatuses = ['En attente', 'Confirmée', 'Livrée', 'Annulée']
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Statut de commande invalide.' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' })
    return res.json(order)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

// 1. جلب كل المنتجات من MongoDB
app.use('/api/products', productRoutes)
app.use('/api/vendor/products', vendorRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Serveur sur http://localhost:${PORT}`)
})