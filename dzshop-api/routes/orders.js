import express from 'express'
import Order from '../models/Order.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.post('/', requireAuth, async (req, res) => {
  try {
    const { articles, total, adresse, telephone, wilaya } = req.body
    const order = await Order.create({
      user: req.user.id,
      articles,
      total,
      adresse,
      telephone,
      wilaya
    })
    return res.status(201).json(order)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.get('/my', requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })
  return res.json(orders)
})

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
  return res.json(orders)
})

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const allowedStatuses = ['En attente', 'Expédiée', 'Livrée']
  if (!allowedStatuses.includes(req.body.statut)) {
    return res.status(400).json({ message: 'Statut de commande invalide.' })
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { statut: req.body.statut },
    { new: true, runValidators: true }
  )
  if (!order) return res.status(404).json({ message: 'Commande introuvable.' })
  return res.json(order)
})

export default router