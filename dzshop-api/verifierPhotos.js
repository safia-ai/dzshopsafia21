// Utilisation (depuis le dossier dzshop-api) :
//   node verifierPhotos.js
// Liste les produits dont la photo est rangée SUR TON ORDINATEUR (dossier uploads/).
// En ligne, Render ne verra jamais ces fichiers : ces photos seront cassées.
// Les photos qui commencent par https:// (Cloudinary ou un lien) sont bonnes.

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Product from './models/Product.js'

const dossierApi = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(dossierApi, '.env') })

try {
  await mongoose.connect(process.env.MONGO_URI_DIRECT?.trim() || process.env.MONGO_URI?.trim())

  const produits = await Product.find().select('nom image').sort({ createdAt: 1 })
  const aRefaire = produits.filter((produit) => produit.image && !/^https:\/\//i.test(produit.image))
  const sansPhoto = produits.filter((produit) => !produit.image)

  console.log(produits.length + ' produit(s) dans la base.')
  if (aRefaire.length === 0) {
    console.log('✅ Aucune photo rangée sur ton ordinateur : tout s\'affichera en ligne.')
  } else {
    console.log('⚠️  ' + aRefaire.length + ' photo(s) à refaire avant la mise en ligne :')
    for (const produit of aRefaire) {
      console.log('   - ' + produit.nom + '   (' + produit.image + ')')
    }
  }
  if (sansPhoto.length > 0) {
    console.log('ℹ️  ' + sansPhoto.length + ' produit(s) sans photo : ' + sansPhoto.map((produit) => produit.nom).join(', '))
  }
} catch (erreur) {
  console.log('❌ Erreur : ' + erreur.message)
} finally {
  await mongoose.disconnect()
}