import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database.js'

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    // Buscar usuario con su rol
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        password_hash: true,
        role_id: true,
        activo: true,
        ultimavez: true,
        imagen_url: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Actualizar última vez que se conectó
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimavez: new Date() }
    })

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )

    // Enviar respuesta sin password_hash
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      token,
      user: {
        ...userWithoutPassword,
        role: user.role.nombre,
        role_id: user.role.id
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        activo: true,
        ultimavez: true,
        imagen_url: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, currentPassword, imagen_url } = req.body
    const userId = req.user.id

    // Obtener el usuario actual para validar contraseña si se quiere cambiar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { password_hash: true }
    })

    // Si se quiere cambiar la contraseña, validar la actual
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'La contraseña actual es requerida' })
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash)
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' })
      }
    }

    const updateData = {}

    if (nombre) updateData.nombre = nombre
    if (apellido) updateData.apellido = apellido
    if (email) {
      // Verificar que el email no esté en uso por otro usuario
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Este correo electrónico ya está en uso' })
      }
      updateData.email = email
    }
    // Permitir actualizar imagen_url incluso si es null (para eliminar)
    if (imagen_url !== undefined) {
      updateData.imagen_url = imagen_url || null
      console.log('Actualizando imagen_url:', imagen_url ? 'Imagen proporcionada' : 'Eliminando imagen')
    }
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        activo: true,
        ultimavez: true,
        imagen_url: true,
        updatedAt: true
      }
    })

    res.json(user)
  } catch (error) {
    next(error)
  }
}

