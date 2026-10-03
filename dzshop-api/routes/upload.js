import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authorizeRoles, requireAuth } from '../middleware/auth.js'

const router = express.Router()
const backendDirectory = path.dirname(fileURLToPath(import.meta.url))
const uploadDirectory = path.join(backendDirectory, '..', 'uploads')
const extensionsByMimeType = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif']
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!extensionsByMimeType.has(file.mimetype)) {
      callback(new Error('Format invalide : choisissez une image JPG, PNG, WebP ou GIF.'))
      return
    }
    callback(null, true)
  }
})

function receiveImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) return next()
    const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'Image trop volumineuse (maximum 3 Mo).'
      : error.message
    return res.status(400).json({ message })
  })
}

function uploadToCloudinary(buffer) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'dzshop', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

router.post('/', requireAuth, authorizeRoles('admin', 'vendor'), receiveImage, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Veuillez sélectionner une image.' })

  try {
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET

    if (cloudinaryConfigured) {
      const result = await uploadToCloudinary(req.file.buffer)
      return res.status(201).json({ success: true, url: result.secure_url, image: result.secure_url })
    }

    await mkdir(uploadDirectory, { recursive: true })
    const filename = `${Date.now()}-${randomUUID()}${extensionsByMimeType.get(req.file.mimetype)}`
    await writeFile(path.join(uploadDirectory, filename), req.file.buffer, { flag: 'wx' })
    const imageUrl = `/uploads/${filename}`
    return res.status(201).json({ success: true, url: imageUrl, image: imageUrl })
  } catch (error) {
    return res.status(502).json({ message: error.message || 'Échec du téléversement de l’image.' })
  }
})

export default router