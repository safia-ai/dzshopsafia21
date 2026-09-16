import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, default: '' },
  prix: { type: Number, required: true, min: 0 },
  categorie: { type: String, default: 'Divers' },
  stock: { type: Number, default: 0 },
  image: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
})

const Product = mongoose.model('Product', productSchema)

export default Product