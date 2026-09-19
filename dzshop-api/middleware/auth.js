import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.')
  }

  return process.env.JWT_SECRET
}

export function createToken(user) {
  return jwt.sign(
    { sub: user.email, id: user.id, nom: user.nom, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  )
}

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!token) return res.status(401).json({ message: 'Authentification requise.' })

  try {
    req.user = jwt.verify(token, getJwtSecret())
    const account = req.user.id
      ? await User.findById(req.user.id).select('_id name email role')
      : await User.findOne({ email: req.user.sub }).select('_id name email role')
    if (!account) return res.status(401).json({ message: 'Utilisateur introuvable.' })
    req.user._id = account._id
    req.user.name = account.name
    req.user.nom = account.name
    req.user.email = account.email
    req.user.role = account.role
    next()
  } catch {
    return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis.' })
  }

  next()
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Permissions insuffisantes.' })
    }
    next()
  }
}