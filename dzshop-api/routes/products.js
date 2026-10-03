import express from 'express'
import Product from '../models/Product.js'
import { authorizeRoles, requireAuth, requireAdmin } from '../middleware/auth.js'
import { uploadProductImage } from '../middleware/upload.js'

const router = express.Router()
export const vendorRouter = express.Router()

const vendorProductFields = ['nom', 'description', 'prix', 'categorie', 'stock', 'image', 'isAdvertised']

function pickProductFields(body, file) {
  const fields = Object.fromEntries(vendorProductFields
    .filter((field) => body[field] !== undefined)
    .map((field) => [field, body[field]]))
  if (file) fields.image = `/uploads/${file.filename}`
  return fields
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

router.post('/', requireAuth, requireAdmin, uploadProductImage, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      ...(req.file && { image: `/uploads/${req.file.filename}` }),
      vendor: req.body.vendor || req.user._id
    })
    return res.status(201).json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, uploadProductImage, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      ...req.body,
      ...(req.file && { image: `/uploads/${req.file.filename}` })
    }, {
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

vendorRouter.post('/', uploadProductImage, async (req, res) => {
  try {
    const product = await Product.create({
      ...pickProductFields(req.body, req.file),
      vendor: req.user._id
    })
    return res.status(201).json(product)
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }
})

vendorRouter.patch('/:id', uploadProductImage, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Produit introuvable' })
    if (!canManageProduct(product, req.user)) return res.status(403).json({ message: 'Ce produit ne vous appartient pas.' })

    Object.assign(product, pickProductFields(req.body, req.file))
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