import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
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
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(users)
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
        createdAt: true,
        updatedAt: true
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

export const createUser = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, role_id, activo } = req.body

    if (!nombre || !apellido || !email || !password || !role_id) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' })
    }

    // Verificar que el rol existe
    const role = await prisma.role.findUnique({
      where: { id: role_id }
    })

    if (!role) {
      return res.status(400).json({ error: 'Rol no válido' })
    }

    // Verificar que el email no existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está en uso' })
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        nombre,
        apellido,
        email,
        password_hash,
        role_id,
        activo: activo !== undefined ? activo : true
      },
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
        imagen_url: true,
        createdAt: true
      }
    })

    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { nombre, apellido, email, password, role_id, activo } = req.body

    // Obtener el usuario que se está intentando editar
    const userToUpdate = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: true
      }
    })

    if (!userToUpdate) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Verificar si el usuario actual es administrador
    const currentUserRole = req.user.role?.toLowerCase() || ''
    const userToUpdateRole = userToUpdate.role?.nombre?.toLowerCase() || ''

    // Si el usuario actual es administrador y está intentando editar a otro administrador, bloquear
    if (currentUserRole === 'administrador' && userToUpdateRole === 'administrador') {
      return res.status(403).json({ error: 'Los administradores no pueden editar a otros administradores' })
    }

    const updateData = {}

    if (nombre) updateData.nombre = nombre
    if (apellido) updateData.apellido = apellido
    if (email) updateData.email = email
    if (role_id) {
      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id: role_id }
      })
      if (!role) {
        return res.status(400).json({ error: 'Rol no válido' })
      }
      
      // Si el usuario actual es administrador, no permitir cambiar el rol a administrador
      if (currentUserRole === 'administrador' && role.nombre.toLowerCase() === 'administrador') {
        return res.status(403).json({ error: 'No puede asignar el rol de administrador' })
      }
      
      updateData.role_id = role_id
    }
    if (activo !== undefined) updateData.activo = activo
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
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

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // No permitir eliminar al usuario actual
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    // Verificar si el usuario actual es administrador
    const currentUserRole = req.user.role?.toLowerCase() || ''
    const userToDeleteRole = user.role?.nombre?.toLowerCase() || ''

    // Si el usuario actual es administrador y está intentando eliminar a otro administrador, bloquear
    if (currentUserRole === 'administrador' && userToDeleteRole === 'administrador') {
      return res.status(403).json({ error: 'Los administradores no pueden eliminar a otros administradores' })
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        id: 'asc'
      }
    })

    res.json(roles)
  } catch (error) {
    next(error)
  }
}

