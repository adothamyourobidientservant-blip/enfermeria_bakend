import express from 'express'
import {
  getVitalSignsByPatient,
  createVitalSign,
  updateVitalSign,
  deleteVitalSign
} from '../controllers/vitalSignController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Solo enfermeros y administradores pueden gestionar signos vitales
router.get('/patient/:patientId', getVitalSignsByPatient)
router.post('/patient/:patientId', requireRole('enfermero', 'administrador'), createVitalSign)
router.put('/:id', requireRole('enfermero', 'administrador'), updateVitalSign)
router.delete('/:id', requireRole('administrador'), deleteVitalSign)

export default router

