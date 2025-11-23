# 🚀 Guía Rápida de Configuración

## Pasos para configurar el backend

### 1. Instalar dependencias
```bash
cd bakend
npm install
```

### 2. Configurar base de datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y corriendo, luego crea la base de datos:

```bash
createdb enfermeria_db
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con:
- Tu URL de conexión a PostgreSQL
- Un JWT_SECRET seguro
- El puerto del servidor (por defecto 3000)
- La URL del frontend (por defecto http://localhost:5173)

### 4. Ejecutar migraciones de Prisma

```bash
npm run prisma:migrate
```

Esto creará todas las tablas en la base de datos.

### 5. Generar cliente de Prisma

```bash
npm run prisma:generate
```

### 6. Poblar base de datos con datos de ejemplo

```bash
npm run prisma:seed
```

Esto creará:
- 2 roles (Administrador, Enfermero)
- 2 usuarios de prueba
- 3 pacientes de ejemplo con signos vitales

### 7. Iniciar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🔐 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

**Administrador:**
- Email: `admin@escuela.edu`
- Contraseña: `admin123`

**Enfermero:**
- Email: `enfermero@escuela.edu`
- Contraseña: `enfermero123`

## 📡 Endpoints Principales

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `GET /api/vital-signs/patient/:patientId` - Ver signos vitales
- `POST /api/vital-signs/patient/:patientId` - Crear signos vitales
- `GET /api/statistics` - Estadísticas (solo admin)

## 🔧 Comandos Útiles

```bash
# Ver datos en Prisma Studio (GUI)
npm run prisma:studio

# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion
```

## ❓ Troubleshooting

**Error de conexión a la base de datos:**
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos existe

**Error de migraciones:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

**Permisos denegados en PostgreSQL:**
- Verifica que el usuario de PostgreSQL tenga permisos para crear bases de datos
- O crea manualmente la base de datos y configura el usuario en `.env`

