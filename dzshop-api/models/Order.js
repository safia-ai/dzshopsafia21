import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prix: { type: Number, required: true, min: 0 },
  qte: { type: Number, required: true, min: 1 }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  articles: { type: [orderItemSchema], required: true, validate: (articles) => articles.length > 0 },
  total: { type: Number, required: true, min: 0 },
  adresse: { type: String, required: true, trim: true },
  telephone: { type: String, trim: true },
  wilaya: { type: String, trim: true },
  statut: { type: String, enum: ['En attente', 'Expédiée', 'Livrée'], default: 'En attente' }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order