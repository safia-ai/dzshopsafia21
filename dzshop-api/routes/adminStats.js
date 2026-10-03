import express from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setHours(0, 0, 0, 0)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const [
      totalUsers,
      totalClients,
      totalVendors,
      totalProducts,
      totalOrders,
      livreesCount,
      enAttenteCount,
      annuleesCount,
      revenueResult,
      topProduits,
      dailySales
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'vendor' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ statut: 'Livrée' }),
      Order.countDocuments({ statut: 'En attente' }),
      Order.countDocuments({ statut: 'Annulée' }),
      Order.aggregate([
        { $match: { statut: { $ne: 'Annulée' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { statut: { $ne: 'Annulée' } } },
        { $unwind: '$articles' },
        {
          $group: {
            _id: '$articles.produit',
            nom: { $first: '$articles.nom' },
            quantite: { $sum: '$articles.qte' },
            chiffreAffaire: { $sum: { $multiply: ['$articles.prix', '$articles.qte'] } }
          }
        },
        { $sort: { quantite: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, statut: { $ne: 'Annulée' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            commandes: { $sum: 1 },
            chiffreAffaire: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    const dailySalesByDate = new Map(dailySales.map((sale) => [sale._id, sale]))
    const ventes7j = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo)
      date.setDate(sevenDaysAgo.getDate() + index)
      const key = date.toISOString().slice(0, 10)
      const sale = dailySalesByDate.get(key)
      return {
        date: key,
        commandes: sale?.commandes || 0,
        chiffreAffaire: sale?.chiffreAffaire || 0
      }
    })

    return res.json({
      totalUsers,
      totalClients,
      totalVendors,
      totalProducts,
      totalOrders,
      livreesCount,
      enAttenteCount,
      annuleesCount,
      chiffreAffaire: revenueResult[0]?.total || 0,
      topProduits,
      ventes7j
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Impossible de charger les statistiques.' })
  }
})

export default router