import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

class UserRoleError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('_id name email role createdAt').sort({ createdAt: -1 })
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.patch('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const nextRole = req.body.role
  if (!['client', 'vendor'].includes(nextRole)) {
    return res.status(400).json({ message: 'Rôle invalide.' })
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Utilisateur introuvable.' })
  }

  const session = await mongoose.startSession()
  try {
    let updatedUser
    await session.withTransaction(async () => {
      const cible = await User.findById(req.params.id).session(session)
      if (!cible) throw new UserRoleError(404, 'Utilisateur introuvable.')
      if (cible.role === 'admin') {
        throw new UserRoleError(403, "Le rôle d'un administrateur ne peut pas être modifié depuis cette page.")
      }

      cible.role = nextRole
      await cible.save({ session })
      updatedUser = {
        _id: cible._id,
        name: cible.name,
        email: cible.email,
        role: cible.role,
        createdAt: cible.createdAt
      }
    })
    return res.json(updatedUser)
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Impossible de modifier le rôle.' })
  } finally {
    await session.endSession()
  }
})

export default router
