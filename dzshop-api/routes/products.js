import express from 'express'
import Product from '../models/Product.js'
import { authorizeRoles, requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
export const vendorRouter = express.Router()

const vendorProductFields = ['nom', 'description', 'prix', 'categorie', 'stock', 'image']

function pickProductFields(body) {
  return Object.fromEntries(vendorProductFields
    .filter((field) => body[field] !== undefined)
    .map((field) => [field, body[field]]))
}

function canManageProduct(product, user) {
  return user.role === 'admin' || product.vendor?.toString() === user._id.toString()
}

router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    return res.json(products)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    return res.json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      vendor: req.body.vendor || req.user._id
    })
    return res.status(201).json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    return res.json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    return res.json({ message: 'Produit supprimé avec succès' })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

vendorRouter.use(requireAuth, authorizeRoles('vendor', 'admin'))

vendorRouter.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { vendor: req.user._id }
    const products = await Product.find(filter).sort({ createdAt: -1 })
    return res.json(products)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})

vendorRouter.post('/', async (req, res) => {
  try {
    const product = await Product.create({
      ...pickProductFields(req.body),
      vendor: req.user._id
    })
    return res.status(201).json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

vendorRouter.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    if (!canManageProduct(product, req.user)) return res.status(403).json({ message: 'Ce produit ne vous appartient pas.' })

    Object.assign(product, pickProductFields(req.body))
    await product.save()
    return res.json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

vendorRouter.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    if (!canManageProduct(product, req.user)) return res.status(403).json({ message: 'Ce produit ne vous appartient pas.' })

    await product.deleteOne()
    return res.json({ message: 'Produit supprimé avec succès' })
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

export default router