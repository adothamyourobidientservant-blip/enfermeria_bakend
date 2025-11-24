# 🔧 Variables de Entorno para Render (Backend)

## ⚠️ ERROR ACTUAL
```
❌ ERROR: DATABASE_URL no está configurada en el archivo .env
```

## ✅ SOLUCIÓN: Configurar Variables de Entorno en Render

### Pasos para Configurar:

1. **Ve a tu servicio web en Render Dashboard**
   - Accede a: https://dashboard.render.com/
   - Selecciona tu servicio web (backend)

2. **Ve a la sección "Environment"**
   - En el menú lateral, haz clic en **"Environment"**

3. **Agrega las siguientes variables de entorno:**

---

## 📋 VARIABLES A CONFIGURAR

### 1. DATABASE_URL (OBLIGATORIA)
```
Key: DATABASE_URL
Value: postgresql://enfermeria_m7l2_user:dtZmAmCs4Vofs0s16rShFxzOTVH6dWxo@dpg-d4idlrs9c44c739emrd0-a.oregon-postgres.render.com:5432/enfermeria_m7l2?sslmode=require
```

### 2. JWT_SECRET (OBLIGATORIA)
```
Key: JWT_SECRET
Value: [GENERA UNO SEGURO - ver instrucciones abajo]
```

**Para generar un JWT_SECRET seguro, ejecuta en tu terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O usa este ejemplo (pero es mejor generar uno nuevo):
```
Key: JWT_SECRET
Value: tu_secreto_jwt_super_seguro_aqui_cambiar_en_produccion
```

### 3. JWT_EXPIRES_IN (OPCIONAL)
```
Key: JWT_EXPIRES_IN
Value: 24h
```

### 4. NODE_ENV (RECOMENDADA)
```
Key: NODE_ENV
Value: production
```

### 5. FRONTEND_URL (OBLIGATORIA para CORS)
```
Key: FRONTEND_URL
Value: https://tu-frontend.netlify.app
```
**⚠️ IMPORTANTE:** Reemplaza `tu-frontend.netlify.app` con la URL real de tu frontend en Netlify.

### 6. PORT (OPCIONAL - Render lo asigna automáticamente)
```
Key: PORT
Value: (dejar vacío o 10000 - Render lo maneja automáticamente)
```

---

## 📝 RESUMEN DE CONFIGURACIÓN

Copia y pega estas variables en Render:

```
DATABASE_URL=postgresql://enfermeria_m7l2_user:dtZmAmCs4Vofs0s16rShFxzOTVH6dWxo@dpg-d4idlrs9c44c739emrd0-a.oregon-postgres.render.com:5432/enfermeria_m7l2?sslmode=require

JWT_SECRET=[GENERA UNO NUEVO - ver arriba]

JWT_EXPIRES_IN=24h

NODE_ENV=production

FRONTEND_URL=https://tu-frontend.netlify.app
```

---

## 🔧 Build Command y Start Command

Asegúrate de que tu servicio web en Render tenga configurado:

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
npm start
```

---

## ✅ Después de Configurar

1. Guarda los cambios en Render
2. El servicio se redesplegará automáticamente
3. Verifica los logs para asegurarte de que todo funciona

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL no está configurada"
- Verifica que hayas agregado la variable en la sección "Environment"
- Asegúrate de que no haya espacios extra en el nombre o valor
- Verifica que la URL esté completa y correcta

### Error: "JWT_SECRET is required"
- Asegúrate de haber configurado JWT_SECRET
- Verifica que no tenga comillas en el valor

### Error de CORS
- Verifica que FRONTEND_URL tenga la URL correcta de tu frontend
- Asegúrate de que sea HTTPS (no HTTP)

---

¿Necesitas ayuda? Revisa los logs en Render para más detalles.


