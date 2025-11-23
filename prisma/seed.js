import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { nombre: 'Administrador' },
    update: {},
    create: {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema'
    }
  })

  const enfermeroRole = await prisma.role.upsert({
    where: { nombre: 'Enfermero' },
    update: {},
    create: {
      nombre: 'Enfermero',
      descripcion: 'Gestión de pacientes y signos vitales'
    }
  })

  console.log('✅ Roles creados')

  // Crear usuarios
  const adminPassword = await bcrypt.hash('admin123', 10)
  const enfermeroPassword = await bcrypt.hash('enfermero123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@escuela.edu' },
    update: {},
    create: {
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@escuela.edu',
      password_hash: adminPassword,
      role_id: adminRole.id,
      activo: true,
      ultimavez: new Date()
    }
  })

  const enfermeroUser = await prisma.user.upsert({
    where: { email: 'enfermero@escuela.edu' },
    update: {},
    create: {
      nombre: 'Enfermero',
      apellido: 'Principal',
      email: 'enfermero@escuela.edu',
      password_hash: enfermeroPassword,
      role_id: enfermeroRole.id,
      activo: true,
      ultimavez: new Date()
    }
  })

  console.log('✅ Usuarios creados')
  console.log('📝 Credenciales de prueba:')
  console.log('   Admin: admin@escuela.edu / admin123')
  console.log('   Enfermero: enfermero@escuela.edu / enfermero123')

  // Crear pacientes de ejemplo
  const pacientes = [
    {
      nombre: 'María',
      apellido: 'González',
      fecha_nacimiento: new Date('2005-05-15'),
      genero: 'femenino',
      area: 'estudiante',
      carrera: 'Ingeniería de Sistemas',
      semestre: '1er semestre',
      cedula: '28457689',
      creado_por_user_id: enfermeroUser.id
    },
    {
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      fecha_nacimiento: new Date('2004-08-20'),
      genero: 'masculino',
      area: 'estudiante',
      carrera: 'Medicina',
      semestre: '2do semestre',
      cedula: '30345678',
      creado_por_user_id: enfermeroUser.id
    },
    {
      nombre: 'Ana',
      apellido: 'Martínez',
      fecha_nacimiento: new Date('2003-12-10'),
      genero: 'femenino',
      area: 'estudiante',
      carrera: 'Enfermería',
      semestre: '3er semestre',
      cedula: '31234567',
      creado_por_user_id: enfermeroUser.id
    },
    {
      nombre: 'Luis',
      apellido: 'Fernández',
      fecha_nacimiento: new Date('2002-03-25'),
      genero: 'masculino',
      area: 'estudiante',
      carrera: 'Psicología',
      semestre: '4to semestre',
      cedula: '29456789',
      creado_por_user_id: enfermeroUser.id
    },
    {
      nombre: 'Sofía',
      apellido: 'López',
      fecha_nacimiento: new Date('2001-07-12'),
      genero: 'femenino',
      area: 'estudiante',
      carrera: 'Derecho',
      semestre: '5to semestre',
      cedula: '27456789',
      creado_por_user_id: enfermeroUser.id
    }
  ]

  // Función para generar un signo vital aleatorio
  const generateRandomVitalSign = (daysAgo) => {
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - daysAgo)
    baseDate.setHours(8 + Math.floor(Math.random() * 10)) // Entre 8 AM y 6 PM
    baseDate.setMinutes(Math.floor(Math.random() * 60))
    
    return {
      temperature: parseFloat((36.0 + Math.random() * 2.0).toFixed(1)), // 36.0 - 38.0
      oxygen_saturation: parseFloat((90 + Math.random() * 10).toFixed(1)), // 90 - 100
      heart_rate: 50 + Math.floor(Math.random() * 70), // 50 - 120
      systolic_pressure: 90 + Math.floor(Math.random() * 50), // 90 - 140
      diastolic_pressure: 55 + Math.floor(Math.random() * 35), // 55 - 90
      timestamp: baseDate,
      notes: Math.random() > 0.7 ? 'Paciente en buen estado' : null // 30% de probabilidad de tener notas
    }
  }

  for (const pacienteData of pacientes) {
    const paciente = await prisma.patient.upsert({
      where: { cedula: pacienteData.cedula },
      update: {},
      create: pacienteData
    })

    // Crear múltiples signos vitales aleatorios para cada paciente (entre 3 y 8 registros)
    const numVitalSigns = 3 + Math.floor(Math.random() * 6) // 3 a 8 registros
    
    for (let i = 0; i < numVitalSigns; i++) {
      const daysAgo = Math.floor(Math.random() * 30) // Últimos 30 días
      const vitalSign = generateRandomVitalSign(daysAgo)
      
      await prisma.vitalSign.create({
        data: {
          patient_id: paciente.id,
          ...vitalSign
        }
      })
    }
    
    console.log(`✅ Paciente ${paciente.nombre} ${paciente.apellido} creado con ${numVitalSigns} registros de signos vitales`)
  }

  console.log('✅ Pacientes de ejemplo creados')
  console.log('✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

