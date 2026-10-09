import multer from 'multer'
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'

const backendDirectory = path.dirname(fileURLToPath(import.meta.url))
const uploadDirectory = path.join(backendDirectory, '..', 'uploads')
const allowedTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp']
])

// La photo reste en mémoire le temps de décider où l'envoyer :
// Cloudinary si les 3 variables sont remplies (en ligne), sinon le dossier uploads (sur ton PC).
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.get(extension) !== file.mimetype) {
      callback(new Error('Format invalide : choisissez une image JPG, PNG ou WebP.'))
      return
    }
    callback(null, true)
  },
  limits: { fileSize: 5 * 1024 * 1024 }
})

function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET)
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

export function uploadProductImage(req, res, next) {
  upload.single('image')(req, res, async (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
        ? 'Image trop volumineuse (maximum 5 Mo).'
        : error.message
      return res.status(400).json({ message })
    }

    // Pas de photo envoyée : on continue sans rien changer.
    if (!req.file) return next()

    try {
      if (cloudinaryConfigured()) {
        // En ligne : la photo part chez Cloudinary et on garde son adresse https://res.cloudinary.com/...
        const result = await uploadToCloudinary(req.file.buffer)
        req.body.image = result.secure_url
        req.file = undefined
        return next()
      }

      // Sur ton PC sans Cloudinary : la photo est rangée dans dzshop-api/uploads.
      await mkdir(uploadDirectory, { recursive: true })
      const extension = path.extname(req.file.originalname).toLowerCase()
      const filename = `${Date.now()}-${randomUUID()}${extension}`
      await writeFile(path.join(uploadDirectory, filename), req.file.buffer)
      req.file.filename = filename
      return next()
    } catch (uploadError) {
      return res.status(502).json({ message: uploadError.message || 'Échec du téléversement de l’image.' })
    }
  })
}