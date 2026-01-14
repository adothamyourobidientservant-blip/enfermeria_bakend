import express from 'express'
import prisma from '../config/database.js'
import { randomUUID } from 'crypto'

const router = express.Router()

// Endpoint para recibir datos del ESP32
router.get('/guardar-lectura', async (req, res) => {
  const { pulso, spo2, temp } = req.query

  if (!pulso || !spo2 || !temp) {
    return res.status(400).send('ERROR: Datos incompletos. Se requieren pulso, spo2 y temp.')
  }

  const heart_rate_val = parseFloat(pulso)
  const oxygen_saturation_val = parseFloat(spo2)
  const temperature_val = parseFloat(temp)

  try {
    // Buscar un paciente temporal o crear uno si no existe
    // Por ahora, guardamos sin patient_id (esto requerirá ajustar el schema)
    // O podemos crear un paciente temporal "ESP32"
    let tempPatient = await prisma.patient.findFirst({
      where: { cedula: 'ESP32_TEMP' }
    })

    if (!tempPatient) {
      // Crear paciente temporal para ESP32
      tempPatient = await prisma.patient.create({
        data: {
          id: randomUUID(),
          nombre: 'ESP32',
          apellido: 'Sensor',
          fecha_nacimiento: new Date('2000-01-01'),
          genero: 'otro',
          area: 'estudiante',
          carrera: 'Sistema de Monitoreo',
          cedula: 'ESP32_TEMP'
        }
      })
    }

    const nuevoRegistro = await prisma.vitalSign.create({
      data: {
        id: randomUUID(),
        patient_id: tempPatient.id,
        temperature: temperature_val,
        oxygen_saturation: oxygen_saturation_val,
        heart_rate: heart_rate_val,
        systolic_pressure: 0, // El ESP32 no envía presión arterial
        diastolic_pressure: 0,
      },
    })
    console.log('✅ Nuevo registro VitalSign insertado:', nuevoRegistro)
    res.status(200).send('DATOS DE SIGNOS VITALES GUARDADOS.')
  } catch (err) {
    console.error('❌ Error al insertar en VitalSign:', err)
    res.status(500).send('ERROR: Falló la inserción en la base de datos.')
  }
})

// Endpoint para obtener la última lectura del ESP32
router.get('/ultima-lectura', async (req, res) => {
  try {
    // Buscar el paciente temporal del ESP32
    const tempPatient = await prisma.patient.findFirst({
      where: { cedula: 'ESP32_TEMP' }
    })

    if (!tempPatient) {
      return res.status(404).json({ error: 'No hay lecturas disponibles' })
    }

    // Obtener la última lectura del ESP32
    const ultimaLectura = await prisma.vitalSign.findFirst({
      where: { patient_id: tempPatient.id },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        temperature: true,
        oxygen_saturation: true,
        heart_rate: true,
        timestamp: true
      }
    })

    if (!ultimaLectura) {
      return res.status(404).json({ error: 'No hay lecturas disponibles' })
    }

    res.json(ultimaLectura)
  } catch (err) {
    console.error('❌ Error al obtener última lectura:', err)
    res.status(500).json({ error: 'Error al obtener la última lectura' })
  }
})

// Endpoint para obtener las últimas N lecturas del ESP32
router.get('/lecturas', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    
    // Buscar el paciente temporal del ESP32
    const tempPatient = await prisma.patient.findFirst({
      where: { cedula: 'ESP32_TEMP' }
    })

    if (!tempPatient) {
      return res.json([])
    }

    // Obtener las últimas lecturas del ESP32
    const lecturas = await prisma.vitalSign.findMany({
      where: { patient_id: tempPatient.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        temperature: true,
        oxygen_saturation: true,
        heart_rate: true,
        timestamp: true
      }
    })

    res.json(lecturas)
  } catch (err) {
    console.error('❌ Error al obtener lecturas:', err)
    res.status(500).json({ error: 'Error al obtener las lecturas' })
  }
})

export default router