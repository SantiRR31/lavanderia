# Reporte de Correcciones y Mejoras Aplicadas

Este documento detalla los cambios, correcciones de seguridad, mejoras de estabilidad y nuevas funcionalidades implementadas en el **Sistema de Lavandería** (tanto en el *Frontend* como en el *Backend*).

---

## 📋 Resumen de Archivos Modificados o Agregados

### Backend
* 🛠️ [backend/server.js](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/server.js) — Configuración principal de Express, carga dinámica de entornos, Helmet, CORS y manejadores de errores globales.
* 🔐 [backend/routes/auth.js](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/routes/auth.js) — Implementación de cookies seguras `HttpOnly`, endpoint de logout y logging de auditoría para la autenticación.
* 📢 [backend/routes/announcements.js](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/routes/announcements.js) — Corrección en el toggle de anuncios y nuevo endpoint para limpieza masiva de inactivos.
* 📝 [backend/utils/logger.js](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/utils/logger.js) *(Nuevo)* — Configuración del logger estructurado con Winston.
* ⚙️ [backend/.env.development](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/.env.development) / [backend/.env.production](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/backend/.env.production) *(Nuevos)* — Archivos de variables de entorno específicos por modo.

### Frontend
* 🌐 [frontend/src/api.js](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/frontend/src/api.js) — Configuración de Axios para envío de cookies con `withCredentials` y redirección automática.
* 🔑 [frontend/src/pages/Login.jsx](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/frontend/src/pages/Login.jsx) — Eliminación del almacenamiento del token en `localStorage`.
* 🚪 [frontend/src/components/Layout.jsx](file:///c:/Users/Santi/OneDrive/Escritorio/santi/Sistema%20de%20lavanderia/frontend/src/components/Layout.jsx) — Integración de llamada de cierre de sesión al servidor antes de limpiar el estado del frontend.

---

## 🛠️ Detalle de las Correcciones y Mejoras

### 1. Robustecimiento de la Seguridad en la Autenticación (JWT via HttpOnly Cookies)
> [!IMPORTANT]
> Anteriormente, el token JWT se guardaba en el `localStorage` del navegador y se enviaba en las cabeceras `Authorization`. Esto exponía la sesión a ataques del tipo **XSS (Cross-Site Scripting)** si un script malicioso lograba ejecutarse en el cliente.

* **Cambio Aplicado:**
  * Al iniciar sesión exitosamente (`POST /api/auth/login`), el servidor adjunta el token JWT en una cookie llamada `token`.
  * La cookie se configura con:
    * `httpOnly: true`: Hace que la cookie sea inaccesible mediante código JavaScript del cliente.
    * `secure: process.env.NODE_ENV === 'production'`: Solo se transmite mediante conexiones HTTPS seguras en producción.
    * `sameSite: 'lax'`: Previene ataques CSRF (Cross-Site Request Forgery).
    * `maxAge: 3600000`: Expira automáticamente en 1 hora.
  * **Cierre de sesión seguro:** Se creó la ruta `POST /api/auth/logout` que elimina la cookie `token` en el navegador usando `res.clearCookie('token')`.
  * **Middleware adaptado:** El middleware de autenticación en backend ahora inspecciona primero las cookies entrantes y, si no existen, recurre al encabezado `Authorization`.

### 2. Configuración de CORS y Protección de Cabeceras
* **Helmet Middleware:** Se integró la librería `helmet` en el backend para configurar cabeceras de respuesta HTTP seguras y proteger el servidor contra ataques comunes (como Clickjacking o Sniffing de tipos MIME).
* **CORS Dinámico con Credenciales:** Se configuró CORS de manera que solo permita solicitudes desde los orígenes declarados en la variable de entorno `ALLOWED_ORIGINS` y obligatoriamente permite la transmisión de credenciales (`credentials: true`), lo cual es indispensable para que las cookies viajen en cada petición.

### 3. Registro de Actividad y Auditoría (Logging con Winston)
* Se creó un módulo de logs estructurados (`backend/utils/logger.js`) utilizando `winston`.
* Registra los mensajes en la consola y los almacena en archivos dentro del directorio `/backend/logs/` (con rotación básica si se requiere):
  * `combined.log`: Todos los eventos del servidor.
  * `error.log`: Únicamente eventos de error.
* **Seguimiento de IPs y Usuarios:** El backend ahora registra la dirección IP origen de cada intento de login, registro de usuario, o eliminación, ayudando a monitorear accesos maliciosos o actividades administrativas inesperadas.

```javascript
// Ejemplo de log estructurado al iniciar sesión
logger.info('Inicio de sesión exitoso', { username: user.username, ip: clientIp });
```

### 4. Estabilidad: Controladores de Errores Globales (Node.js)
Para evitar que el servidor de backend colapse y se detenga ante fallos imprevistos, se añadieron oyentes globales en `server.js`:
* `uncaughtException`: Captura errores no controlados en el hilo principal del proceso, escribe el log detallado del error y apaga el servidor ordenadamente en lugar de fallar abruptamente.
* `unhandledRejection`: Captura promesas asíncronas rechazadas que no tengan un bloque `.catch()`, registrándolas en el log de errores.

### 5. Carga Dinámica de Variables de Entorno
* El backend ahora detecta el entorno (`NODE_ENV` definido como `development` o `production`).
* Se lee dinámicamente el archivo de variables correspondiente (`.env.development` o `.env.production`) y cae sobre el archivo `.env` por defecto. Esto ayuda a no mezclar credenciales de base de datos ni configuraciones de seguridad entre desarrollo y producción.

### 6. Optimización en la Gestión de Anuncios
* **Validación de Existencia en Toggle:** El endpoint `PATCH /api/announcements/:id/toggle` ahora verifica primero si el anuncio realmente existe antes de intentar actualizar su estado. Si no existe, devuelve un estado `404 Not Found` en lugar de disparar un error interno de base de datos.
* **Eliminación Masiva (Bulk Cleanup):** Se agregó el endpoint `DELETE /api/announcements/bulk/inactive` para eliminar todos los anuncios inactivos de la base de datos de manera rápida y en una sola consulta.

---

## 🚀 Cómo Iniciar el Proyecto y Probar los Cambios

### Requisitos Previos
Asegúrate de contar con tus archivos `.env.development` y `.env.production` configurados en la raíz del backend (se crearon plantillas básicas para ayudarte).

### 1. Arrancar el Backend
1. Entra a la carpeta de backend.
2. Instala las dependencias nuevas (`helmet`, `cookie-parser`, `winston`):
   ```bash
   cd backend
   npm install
   ```
3. Ejecuta las migraciones de Prisma si es la primera vez que configuras la base de datos local:
   ```bash
   npx prisma migrate dev
   ```
4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

### 2. Arrancar el Frontend
1. Abre otra terminal, entra a la carpeta frontend e instala las dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecuta el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```

### 3. Verificar las Cookies
1. Abre la aplicación en tu navegador (por defecto en `http://localhost:5173`).
2. Ve al panel de herramientas de desarrollador (**F12**) -> pestaña **Aplicación (Application)** -> **Cookies** -> selecciona la URL de tu backend (`http://localhost:5000`).
3. Inicia sesión. Deberías ver que aparece la cookie `token` con los flags `HTTPOnly` activados y sin almacenamiento visible en el `LocalStorage` del navegador (excepto por el `username`).
