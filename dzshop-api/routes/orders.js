import express from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

class OrderRequestError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const telephoneInput = req.body.telephone?.trim().replace(/[\s().-]/g, '')
    const telephone = telephoneInput?.startsWith('+213')
      ? `0${telephoneInput.slice(4)}`
      : telephoneInput
    const wilaya = req.body.wilaya?.trim()
    const adresse = req.body.adresse?.trim()
    const { articles } = req.body

    if (!telephone || !wilaya || !adresse) {
      return res.status(400).json({ message: 'Veuillez renseigner votre téléphone et adresse de livraison.' })
    }
    if (!/^0[567]\d{8}$/.test(telephone)) {
      return res.status(400).json({ message: 'Le numéro doit être un numéro mobile algérien valide.' })
    }
    if (!Array.isArray(articles) || articles.length === 0 || articles.length > 50) {
      return res.status(400).json({ message: 'Votre panier est vide ou contient trop d’articles.' })
    }

    const requestedItems = articles.map((item) => ({
      productId: item?.produit,
      quantity: Number(item?.qte)
    }))
    if (requestedItems.some((item) => !mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
      return res.status(400).json({ message: 'Chaque article doit avoir un produit valide et une quantité comprise entre 1 et 99.' })
    }

    const requestedQuantities = new Map()
    for (const item of requestedItems) {
      const id = String(item.productId)
      requestedQuantities.set(id, (requestedQuantities.get(id) || 0) + item.quantity)
    }

    const session = await mongoose.startSession()
    let order
    try {
      await session.withTransaction(async () => {
        const productIds = [...requestedQuantities.keys()]
        const products = await Product.find({ _id: { $in: productIds } }).session(session)
        const productsById = new Map(products.map((product) => [String(product._id), product]))

        if (productsById.size !== productIds.length) {
          throw new OrderRequestError(404, 'Produit introuvable')
        }

        for (const [productId, quantity] of requestedQuantities) {
          const product = productsById.get(productId)
          if (product.stock < quantity) {
            throw new OrderRequestError(400, 'Stock insuffisant pour ce produit')
          }

          const stockUpdate = await Product.updateOne(
            { _id: product._id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { session }
          )
          if (stockUpdate.modifiedCount !== 1) {
            throw new OrderRequestError(400, 'Stock insuffisant pour ce produit')
          }
        }

        let subtotal = 0
        const orderItems = requestedItems.map(({ productId, quantity }) => {
          const product = productsById.get(String(productId))
          subtotal += product.prix * quantity
          return {
            produit: product._id,
            nom: product.nom,
            prix: product.prix,
            qte: quantity
          }
        })

        // Les prix et le total du client sont ignorés; seuls les prix MongoDB font foi.
        const livraison = subtotal >= 10000 || subtotal === 0 ? 0 : 500
        order = new Order({
          user: req.user._id,
          articles: orderItems,
          livraison,
          total: subtotal + livraison,
          adresse,
          telephone,
          wilaya,
        })
        await order.save({ session })
      })
    } finally {
      await session.endSession()
    }

    return res.status(201).json({ success: true, orderId: order._id.toString(), order })
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Impossible d’enregistrer la commande.' })
  }
})

router.get(['/myorders', '/my'], requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.json(orders)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Impossible de charger vos commandes.' })
  }
})

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
  return res.json(orders)
})

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const nextStatus = req.body.statut
  const allowedStatuses = ['En attente', 'Expédiée', 'Livrée', 'Annulée']
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: 'Statut de commande invalide.' })
  }

  const session = await mongoose.startSession()
  let updatedOrder
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session)
      if (!order) throw new OrderRequestError(404, 'Commande introuvable.')
      if (order.statut === 'Annulée') {
        throw new OrderRequestError(400, 'Une commande annulée ne peut plus être modifiée.')
      }

      if (nextStatus === 'Annulée' && !order.stockRestitue) {
        for (const item of order.articles) {
          await Product.updateOne(
            { _id: item.produit },
            { $inc: { stock: item.qte } },
            { session }
          )
        }
        order.stockRestitue = true
      }

      order.statut = nextStatus
      await order.save({ session })
      updatedOrder = order
    })
    return res.json(updatedOrder)
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Impossible de modifier la commande.' })
  } finally {
    await session.endSession()
  }
})

export default router