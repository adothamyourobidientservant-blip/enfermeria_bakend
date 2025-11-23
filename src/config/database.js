import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Función para probar la conexión a la base de datos
export async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ PostgreSQL y Prisma ORM conectados correctamente')
    return true
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message)
    if (error.code === 'P1001') {
      console.error('💡 Verifica que PostgreSQL esté corriendo y que la URL en .env sea correcta')
    } else if (error.code === 'P1000') {
      console.error('💡 Verifica que la base de datos exista y que el usuario tenga permisos')
    }
    throw error
  }
}

// Manejar desconexión al cerrar la aplicación
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma

