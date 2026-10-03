import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  nom: { type: String, required: true, trim: true },
  prix: { type: Number, required: true, min: 0 },
  qte: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nomClient: { type: String, trim: true },
  articles: { type: [orderItemSchema], required: true, validate: (articles) => articles.length > 0 },
  livraison: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  adresse: { type: String, required: true, trim: true },
  commune: { type: String, trim: true, default: '' },
  telephone: { type: String, trim: true },
  wilaya: { type: String, trim: true },
  note: { type: String, trim: true, default: '' },
  modePaiement: { type: String, default: 'Paiement à la livraison' },
  statut: { type: String, enum: ['En attente', 'Expédiée', 'Livrée', 'Annulée'], default: 'En attente' },
  stockRestitue: { type: Boolean, default: false }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order