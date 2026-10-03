import multer from 'multer'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const backendDirectory = path.dirname(fileURLToPath(import.meta.url))
const uploadDirectory = path.join(backendDirectory, '..', 'uploads')
const allowedTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp']
])

mkdirSync(uploadDirectory, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase()
      callback(null, `${Date.now()}-${randomUUID()}${extension}`)
    }
  }),
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

export function uploadProductImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) return next()

    const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'Image trop volumineuse (maximum 5 Mo).'
      : error.message
    return res.status(400).json({ message })
  })
}