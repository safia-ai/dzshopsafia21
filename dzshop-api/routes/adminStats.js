import express from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Les jours du graphique sont comptés à l'heure d'Alger, sur ton PC comme sur Render.
// (Avant, le début des 7 jours était en heure locale mais les commandes étaient
// rangées en heure UTC : les ventes du jour n'apparaissaient jamais sur ton PC.)
const FUSEAU = 'Africa/Algiers'
const UN_JOUR = 24 * 60 * 60 * 1000

function jourAlger(date) {
  // "en-CA" écrit les dates sous la forme 2026-10-03
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSEAU }).format(date)
}

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const maintenant = Date.now()
    // Les 7 jours affichés, du plus ancien à aujourd'hui (heure d'Alger).
    const jours = Array.from({ length: 7 }, (_, index) => jourAlger(new Date(maintenant - (6 - index) * UN_JOUR)))
    // On prend 8 jours de commandes pour être sûr de ne rien rater, puis on ne garde que les 7 jours affichés.
    const debutRecherche = new Date(maintenant - 8 * UN_JOUR)

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
        { $match: { createdAt: { $gte: debutRecherche }, statut: { $ne: 'Annulée' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: FUSEAU } },
            commandes: { $sum: 1 },
            chiffreAffaire: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    const dailySalesByDate = new Map(dailySales.map((sale) => [sale._id, sale]))
    const ventes7j = jours.map((key) => {
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