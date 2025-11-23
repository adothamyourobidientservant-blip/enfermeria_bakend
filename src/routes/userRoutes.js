import express from 'express'
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles
} from '../controllers/userController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Solo administradores pueden gestionar usuarios
router.get('/roles', getAllRoles)
router.get('/', requireRole('administrador'), getAllUsers)
router.get('/:id', requireRole('administrador'), getUserById)
router.post('/', requireRole('administrador'), createUser)
router.put('/:id', requireRole('administrador'), updateUser)
router.delete('/:id', requireRole('administrador'), deleteUser)

export default router

