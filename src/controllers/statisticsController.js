import prisma from '../config/database.js'

export const getStatistics = async (req, res, next) => {
  try {
    // Total de pacientes
    const totalPatients = await prisma.patient.count()

    // Total de signos vitales
    const totalVitalSigns = await prisma.vitalSign.count()

    // Usuarios activos
    const activeUsers = await prisma.user.count({
      where: {
        activo: true
      }
    })

    // Pacientes por grado/semestre
    const patientsByGrade = await prisma.patient.groupBy({
      by: ['semestre'],
      where: {
        area: 'estudiante',
        semestre: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        semestre: 'asc'
      }
    })

    // Pacientes atendidos por día (últimos 30 días) - basado en signos vitales
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Inicio del día actual
    
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Obtener todos los signos vitales de los últimos 30 días
    const vitalSigns = await prisma.vitalSign.findMany({
      where: {
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        patient_id: true,
        timestamp: true
      }
    })

    // Agrupar por día - contando cada toma de muestra (cada registro de signos vitales)
    const patientsByDayMap = new Map()
    
    // Inicializar todos los días de los últimos 30 días con 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateKey = date.toISOString().split('T')[0]
      patientsByDayMap.set(dateKey, 0) // Contador de tomas de muestra
    }

    // Contar cada toma de muestra (cada registro de signos vitales) por día
    vitalSigns.forEach(vitalSign => {
      const vitalSignDate = new Date(vitalSign.timestamp)
      vitalSignDate.setHours(0, 0, 0, 0)
      const dateKey = vitalSignDate.toISOString().split('T')[0]
      
      if (patientsByDayMap.has(dateKey)) {
        patientsByDayMap.set(dateKey, patientsByDayMap.get(dateKey) + 1) // Incrementar contador de tomas
      }
    })

    // Convertir a array para el frontend y ordenar por fecha
    const patientsByDayArray = Array.from(patientsByDayMap.entries())
      .map(([date, count]) => ({
        date,
        count: count // Contar todas las tomas de muestra (no solo pacientes únicos)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calcular edad promedio
    const patients = await prisma.patient.findMany({
      select: {
        fecha_nacimiento: true
      }
    })

    let totalAge = 0
    const todayDate = new Date()

    patients.forEach(patient => {
      const birthDate = new Date(patient.fecha_nacimiento)
      const age = todayDate.getFullYear() - birthDate.getFullYear()
      const monthDiff = todayDate.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
        totalAge += age - 1
      } else {
        totalAge += age
      }
    })

    const averageAge = patients.length > 0 ? (totalAge / patients.length).toFixed(1) : 0

    // Registros recientes (últimos 4 pacientes creados)
    const recentPatients = await prisma.patient.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        semestre: true,
        area: true,
        carrera: true,
        createdAt: true
      }
    })

    res.json({
      totalPatients,
      totalVitalSigns,
      activeUsers,
      patientsByGrade: patientsByGrade.map(item => ({
        grade: item.semestre,
        count: item._count.id
      })),
      patientsByDay: patientsByDayArray,
      averageAge: parseFloat(averageAge),
      recentPatients
    })
  } catch (error) {
    next(error)
  }
}

