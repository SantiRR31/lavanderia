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
2. Actualiza el archivo `.env` con tu cadena de conexión de PostgreSQL:
   ```
   DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/laundry_db?schema=public"
   ```
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
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

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
