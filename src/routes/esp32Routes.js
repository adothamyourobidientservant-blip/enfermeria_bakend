import express from 'express'
import prisma from '../config/database.js'

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
    const nuevoRegistro = await prisma.vitalSign.create({
      data: {
        temperature: temperature_val,
        oxygen_saturation: oxygen_saturation_val,
        heart_rate: heart_rate_val,
      },
    })
    console.log('✅ Nuevo registro VitalSign insertado:', nuevoRegistro)
    res.status(200).send('DATOS DE SIGNOS VITALES GUARDADOS.')
  } catch (err) {
    console.error('❌ Error al insertar en VitalSign:', err)
    res.status(500).send('ERROR: Falló la inserción en la base de datos.')
  }
})

export default router