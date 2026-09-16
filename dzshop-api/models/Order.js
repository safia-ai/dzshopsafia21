import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false })

const shippingAddressSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  wilaya: { type: String, required: true },
  city: { type: String, required: true },
  postcode: { type: String, required: true },
  district: { type: String, required: true },
  street: { type: String }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['En attente', 'Confirmée', 'Livrée', 'Annulée'], default: 'En attente' }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)

export default Order