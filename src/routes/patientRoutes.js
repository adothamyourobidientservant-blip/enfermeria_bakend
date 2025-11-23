import express from 'express'
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticateToken)

// Solo enfermeros y administradores pueden gestionar pacientes
router.get('/', getAllPatients)
router.get('/:id', getPatientById)
router.post('/', requireRole('enfermero', 'administrador'), createPatient)
router.put('/:id', requireRole('enfermero', 'administrador'), updatePatient)
router.delete('/:id', requireRole('enfermero', 'administrador'), deletePatient)

export default router

