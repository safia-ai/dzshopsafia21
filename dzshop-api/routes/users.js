import express from 'express'
import User from '../models/User.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('_id name email role createdAt').sort({ createdAt: -1 })
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body
    if (!['client', 'vendor'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' })
    }

    const nextRole = role

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: nextRole },
      { new: true, runValidators: true }
    ).select('_id name email role createdAt')

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    return res.json(user)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

export default router
