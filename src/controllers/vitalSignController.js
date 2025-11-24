import prisma from '../config/database.js'
import { randomUUID } from 'crypto'

export const getVitalSignsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params

    if (!patientId) {
      return res.status(400).json({ error: 'ID de paciente inválido' })
    }

    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }

    const vitalSigns = await prisma.vitalSign.findMany({
      where: { patient_id: patientId },
      orderBy: {
        timestamp: 'desc'
      }
    })

    res.json(vitalSigns)
  } catch (error) {
    next(error)
  }
}

export const createVitalSign = async (req, res, next) => {
  try {
    const { patientId } = req.params

    if (!patientId) {
      return res.status(400).json({ error: 'ID de paciente inválido' })
    }

    const {
      temperature,
      oxygen_saturation,
      heart_rate,
      systolic_pressure,
      diastolic_pressure,
      notes,
      timestamp
    } = req.body

    // Validar campos requeridos
    if (
      temperature === undefined ||
      heart_rate === undefined ||
      systolic_pressure === undefined ||
      diastolic_pressure === undefined
    ) {
      return res.status(400).json({
        error: 'Temperatura, ritmo cardiaco y presión arterial son requeridos'
      })
    }

    // Validar rangos básicos
    if (temperature < 30 || temperature > 45) {
      return res.status(400).json({ error: 'La temperatura debe estar entre 30°C y 45°C' })
    }

    if (heart_rate < 40 || heart_rate > 200) {
      return res.status(400).json({ error: 'El ritmo cardiaco debe estar entre 40 y 200 bpm' })
    }

    if (systolic_pressure < 50 || systolic_pressure > 250) {
      return res.status(400).json({ error: 'La presión sistólica debe estar entre 50 y 250 mmHg' })
    }

    if (diastolic_pressure < 30 || diastolic_pressure > 150) {
      return res.status(400).json({ error: 'La presión diastólica debe estar entre 30 y 150 mmHg' })
    }

    if (systolic_pressure <= diastolic_pressure) {
      return res.status(400).json({
        error: 'La presión sistólica debe ser mayor que la diastólica'
      })
    }

    if (oxygen_saturation !== undefined && (oxygen_saturation < 70 || oxygen_saturation > 100)) {
      return res.status(400).json({
        error: 'La saturación de oxígeno debe estar entre 70% y 100%'
      })
    }

    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        id: randomUUID(),
        patient_id: patientId,
        temperature: parseFloat(temperature),
        oxygen_saturation: oxygen_saturation ? parseFloat(oxygen_saturation) : null,
        heart_rate: parseInt(heart_rate),
        systolic_pressure: parseInt(systolic_pressure),
        diastolic_pressure: parseInt(diastolic_pressure),
        notes: notes || null,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      },
      include: {
        patient: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cedula: true
          }
        }
      }
    })

    res.status(201).json(vitalSign)
  } catch (error) {
    next(error)
  }
}

export const updateVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'ID de signo vital inválido' })
    }

    const {
      temperature,
      oxygen_saturation,
      heart_rate,
      systolic_pressure,
      diastolic_pressure,
      notes,
      timestamp
    } = req.body

    const vitalSign = await prisma.vitalSign.update({
      where: { id },
      data: {
        ...(temperature !== undefined && { temperature: parseFloat(temperature) }),
        ...(oxygen_saturation !== undefined && {
          oxygen_saturation: oxygen_saturation ? parseFloat(oxygen_saturation) : null
        }),
        ...(heart_rate !== undefined && { heart_rate: parseInt(heart_rate) }),
        ...(systolic_pressure !== undefined && { systolic_pressure: parseInt(systolic_pressure) }),
        ...(diastolic_pressure !== undefined && { diastolic_pressure: parseInt(diastolic_pressure) }),
        ...(notes !== undefined && { notes }),
        ...(timestamp && { timestamp: new Date(timestamp) })
      },
      include: {
        patient: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    })

    res.json(vitalSign)
  } catch (error) {
    next(error)
  }
}

export const deleteVitalSign = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'ID de signo vital inválido' })
    }

    await prisma.vitalSign.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

