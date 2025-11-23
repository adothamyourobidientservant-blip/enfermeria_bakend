import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' })
    }
    req.user = user
    next()
  })
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const userRole = req.user.role?.toLowerCase() || ''
    const allowedRoles = roles.map(r => r.toLowerCase())

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'No tiene permisos para esta acción' })
    }

    next()
  }
}

