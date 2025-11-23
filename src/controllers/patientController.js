import prisma from '../config/database.js'

export const getAllPatients = async (req, res, next) => {
  try {
    const { search, area } = req.query

    const where = {}
    
    if (search) {
      where.OR = [
        { cedula: { contains: search } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (area) {
      where.area = area
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        creado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        signos_vitales: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1 // Solo el último registro
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(patients)
  } catch (error) {
    next(error)
  }
}

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'ID de paciente inválido' })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: idNum },
      include: {
        creado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        signos_vitales: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' })
    }

    res.json(patient)
  } catch (error) {
    next(error)
  }
}

export const createPatient = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      genero,
      area,
      carrera,
      semestre,
      cedula,
      alergias,
      medicamentos,
      contacto_emergencia,
      telefono_emergencia
    } = req.body

    // Validar campos requeridos
    if (!nombre || !apellido || !fecha_nacimiento || !genero || !area || !carrera || !cedula) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' })
    }

    // Si es estudiante, semestre es requerido
    if (area === 'estudiante' && !semestre) {
      return res.status(400).json({ error: 'El semestre es requerido para estudiantes' })
    }

    // Normalizar cédula (solo números)
    const cedulaNormalizada = cedula.replace(/\D/g, '')

    const patient = await prisma.patient.create({
      data: {
        nombre,
        apellido,
        fecha_nacimiento: new Date(fecha_nacimiento),
        genero,
        area,
        carrera,
        semestre: area === 'estudiante' ? semestre : null,
        cedula: cedulaNormalizada,
        alergias,
        medicamentos,
        contacto_emergencia,
        telefono_emergencia,
        creado_por_user_id: req.user?.id
      },
      include: {
        creado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    })

    res.status(201).json(patient)
  } catch (error) {
    next(error)
  }
}

export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params
    const idNum = parseInt(id)

    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'ID de paciente inválido' })
    }

    const {
      nombre,
      apellido,
      fecha_nacimiento,
      genero,
      area,
      carrera,
      semestre,
      alergias,
      medicamentos,
      contacto_emergencia,
      telefono_emergencia
    } = req.body

    const patient = await prisma.patient.update({
      where: { id: idNum },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(fecha_nacimiento && { fecha_nacimiento: new Date(fecha_nacimiento) }),
        ...(genero && { genero }),
        ...(area && { area }),
        ...(carrera && { carrera }),
        ...(semestre !== undefined && { semestre: area === 'estudiante' ? semestre : null }),
        ...(alergias !== undefined && { alergias }),
        ...(medicamentos !== undefined && { medicamentos }),
        ...(contacto_emergencia !== undefined && { contacto_emergencia }),
        ...(telefono_emergencia !== undefined && { telefono_emergencia })
      },
      include: {
        creado_por: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    })

    res.json(patient)
  } catch (error) {
    next(error)
  }
}

export const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params
    const patientId = parseInt(id)

    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'ID de paciente inválido' })
    }

    await prisma.patient.delete({
      where: { id: patientId }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

