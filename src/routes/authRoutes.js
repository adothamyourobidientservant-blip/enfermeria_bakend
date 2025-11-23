import express from 'express'
import { login, getProfile, updateProfile } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Login (público)
router.post('/login', login)

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, getProfile)

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, updateProfile)

export default router

