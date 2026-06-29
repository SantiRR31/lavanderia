# Sistema de Seguimiento de Pedidos de Lavandería

Este sistema permite a una lavandería gestionar pedidos de clientes mediante un panel administrativo y permite a los clientes consultar el estado de su pedido mediante un ticket único.

## Estructura del Proyecto

- `/backend`: API REST (Node.js, Express, Prisma, PostgreSQL, JWT).
- `/frontend`: Interfaz de usuario (React, Vite, TailwindCSS).

## Requisitos Previos

- **Node.js**: v18 o superior.
- **PostgreSQL**: Una base de datos en funcionamiento.

## Configuración y Puesta en Marcha

### 1. Configuración del Backend

1. Entra en la carpeta `backend/`.
2. El proyecto cuenta con soporte para **Entornos Separados**:
   - Para desarrollo: Copia o renombra el archivo `.env.example` a `.env.development` y configura tus variables locales (base de datos de desarrollo, secretos, CORS origen).
   - Para producción: Copia o renombra a `.env.production` o usa variables de entorno en tu plataforma de despliegue.
   - Las variables clave a configurar son:
     - `NODE_ENV`: Indica el entorno actual (`development` o `production`).
     - `PORT`: Puerto en el que correrá el servidor.
     - `DATABASE_URL`: Cadena de conexión de PostgreSQL.
     - `JWT_SECRET`: Llave secreta para firmar tokens.
     - `ALLOWED_ORIGINS`: Lista separada por comas de orígenes permitidos para CORS (ej: `http://localhost:5173`).
3. Ejecuta los siguientes comandos para sincronizar la base de datos y generar el cliente de Prisma:
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   ```
4. **Sembrar usuario administrador**:
   Ejecuta el script de semilla para crear el usuario `admin` con contraseña `password`:
   ```bash
   node prisma/seed.js
   ```
5. Inicia el servidor en el entorno deseado:
   - **Desarrollo**:
     ```bash
     npm run dev
     ```
     *(Cargará el archivo `.env.development` y el logger mostrará los eventos en consola además de guardarlos).*
   - **Producción**:
     ```bash
     NODE_ENV=production npm start
     ```
     *(Cargará el archivo `.env.production` e iniciará en modo seguro con cabeceras Helmet reforzadas).*

### 2. Configuración del Frontend

1. Entra en la carpeta `frontend/`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm run dev
   ```

## Funcionalidades Implementadas

### Panel Admin (`/login` -> `/admin`)
- **Login**: Acceso protegido con JWT.
- **Panel de Pedidos**: Lista completa de pedidos con filtros por ticket/teléfono.
- **Nuevo Pedido**: Formulario para registrar cliente y detalles del servicio.
- **Gestión de Estados**: Cambio rápido de estado (Recibido, En proceso, Listo, Entregado).

### Portal de Clientes (`/tracking`)
- **Consulta de Ticket**: Interfaz limpia para que el cliente ingrese su código.
- **Estado Visual**: Stepper dinámico que muestra el progreso del pedido.
- **Detalles**: Información sobre fecha estimada de entrega y tipo de servicio.

## Tecnologías Utilizadas
- **Frontend**: React, TailwindCSS, Lucide React, Axios, React Router.
- **Backend**: Express, Prisma, JWT, Bcrypt.
- **Base de Datos**: PostgreSQL.
