import express from 'express'
import { getStatistics } from '../controllers/statisticsController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Solo administradores pueden ver estadísticas
router.get('/', authenticateToken, requireRole('administrador'), getStatistics)

export default router

