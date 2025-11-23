import dotenv from 'dotenv'
import { testConnection } from '../config/database.js'
import prisma from '../config/database.js'

// Cargar variables de entorno
dotenv.config()

async function main() {
  console.log('🔍 Verificando conexión a la base de datos...\n')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada en el archivo .env')
    console.error('💡 Crea un archivo .env con la siguiente variable:')
    console.error('   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/enfermeria_db?schema=public"')
    process.exit(1)
  }

  try {
    await testConnection()
    
    // Probar una consulta simple
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Consulta de prueba exitosa')
    console.log(`📊 PostgreSQL: ${result[0].version.split(',')[0]}\n`)
    
    // Verificar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`📋 Tablas encontradas: ${tables.length}`)
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    
    console.log('\n✅ Base de datos configurada correctamente')
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error al verificar la conexión:', error.message)
    console.error('\n💡 Verifica:')
    console.error('   1. PostgreSQL esté corriendo: sudo systemctl status postgresql')
    console.error('   2. La base de datos exista: createdb enfermeria_db')
    console.error('   3. Las credenciales en .env sean correctas')
    console.error('   4. El usuario tenga permisos')
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()



