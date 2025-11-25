import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import vitalSignRoutes from './routes/vitalSignRoutes.js'
import userRoutes from './routes/userRoutes.js'
import esp32Routes from './routes/esp32Routes.js'
import statisticsRoutes from './routes/statisticsRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { testConnection } from './config/database.js'
import prisma from './config/database.js'

// Cargar variables de entorno
dotenv.config()

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en el archivo .env')
  console.error('💡 Crea un archivo .env con la siguiente variable:')
  console.error('   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/enfermeria_db?schema=public"')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3003

// Configuración de CORS
// Permite múltiples orígenes para desarrollo y producción
const getAllowedOrigins = () => {
  const origins = []
  
  // Agregar FRONTEND_URL si está configurada
  if (process.env.FRONTEND_URL) {
    const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim())
    origins.push(...frontendUrls)
  }
  
  // En producción, permitir también el dominio de Netlify común
  if (process.env.NODE_ENV === 'production') {
    // Permitir cualquier subdominio de netlify.app
    origins.push(/^https:\/\/.*\.netlify\.app$/)
    origins.push(/^https:\/\/.*\.netlify\.com$/)
  } else {
    // En desarrollo, agregar localhost
    if (!origins.includes('http://localhost:5173')) {
      origins.push('http://localhost:5173')
    }
  }
  
  return origins
}

const allowedOrigins = getAllowedOrigins()

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('🌐 CORS: Request sin origen (permitido)')
      return callback(null, true)
    }
    
    // Verificar si el origen está permitido
    let isAllowed = false
    
    for (const allowed of allowedOrigins) {
      if (typeof allowed === 'string') {
        // Comparación exacta o parcial
        if (origin === allowed || origin.includes(allowed)) {
          isAllowed = true
          break
        }
      } else if (allowed instanceof RegExp) {
        // Comparación con regex
        if (allowed.test(origin)) {
          isAllowed = true
          break
        }
      }
    }
    
    if (isAllowed) {
      console.log(`✅ CORS: Origen permitido: ${origin}`)
      callback(null, true)
    } else {
      console.warn(`⚠️ CORS: Origen no permitido: ${origin}`)
      console.warn(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NO CONFIGURADA'}`)
      console.warn(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
      // En producción, permitir temporalmente para evitar bloqueos
      // PERO es importante configurar FRONTEND_URL correctamente
      if (process.env.NODE_ENV === 'production') {
        console.warn(`   ⚠️ PERMITIENDO TEMPORALMENTE - Configura FRONTEND_URL: ${origin}`)
        callback(null, true)
      } else {
        callback(null, true)
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Logging de configuración al iniciar
console.log('\n🌐 Configuración CORS:')
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NO CONFIGURADA'}`)
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
console.log(`   Orígenes permitidos: ${allowedOrigins.length} configurados\n`)
// Aumentar límite de tamaño para imágenes en base64 (10MB)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// Health check
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`
    res.json({ 
      status: 'ok', 
      message: 'Servidor y base de datos funcionando correctamente',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Error de conexión a la base de datos',
      database: 'disconnected',
      error: error.message
    })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/vital-signs', vitalSignRoutes)
app.use('/api/users', userRoutes)
app.use('/api/statistics', statisticsRoutes)
app.use('/api/esp32', esp32Routes)

// Error handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Iniciar servidor con verificación de base de datos
async function startServer() {
  try {
    // Probar conexión a la base de datos antes de iniciar el servidor
    await testConnection()
    
    // Obtener información de PostgreSQL
    let dbInfo = 'conectada'
    let pgVersion = 'desconocida'
    try {
      const versionResult = await prisma.$queryRaw`SELECT version()`
      if (versionResult && versionResult[0]) {
        pgVersion = versionResult[0].version.split(',')[0].trim()
      }
      const dbUrl = process.env.DATABASE_URL
      if (dbUrl) {
        const match = dbUrl.match(/@([^:]+):(\d+)\/([^?]+)/)
        if (match) {
          dbInfo = `${match[3]}@${match[1]}:${match[2]}`
        }
      }
    } catch (e) {
      // Si falla, usar información básica
    }
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60))
      console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE')
      console.log('='.repeat(60))
      console.log(`📡 Puerto: ${PORT}`)
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
      console.log('')
      console.log('🗄️  BASE DE DATOS:')
      console.log(`   ✅ PostgreSQL: ${pgVersion}`)
      console.log(`   ✅ Prisma ORM: Conectado`)
      console.log(`   ✅ Base de datos: ${dbInfo}`)
      console.log('')
      console.log('='.repeat(60))
      console.log(`✨ Servidor listo en http://localhost:${PORT}`)
      console.log('='.repeat(60) + '\n')
    })
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor debido a un error de conexión a la base de datos')
    console.error('💡 Asegúrate de que:')
    console.error('   1. PostgreSQL esté corriendo')
    console.error('   2. La base de datos exista')
    console.error('   3. Las credenciales en .env sean correctas')
    console.error('   4. El usuario tenga permisos para acceder a la base de datos')
    process.exit(1)
  }
}

startServer()

