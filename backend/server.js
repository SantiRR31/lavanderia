const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration dynamically
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');

// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Excepción no capturada (uncaughtException)', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesa no controlada (unhandledRejection)', { 
        reason: reason instanceof Error ? reason.message : String(reason), 
        stack: reason instanceof Error ? reason.stack : undefined 
    });
});

const prisma = new PrismaClient();
const app = express();

// Secure Headers
app.use(helmet());

// CORS Whitelist and credentials configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        } else {
            return callback(new Error('Bloqueado por CORS: Origen no permitido'));
        }
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Routes will go here
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const serviceRoutes = require('./routes/services');
const reportRoutes = require('./routes/reports');
const announcementRoutes = require('./routes/announcements');

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT} en modo ${nodeEnv}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Desconectado de Prisma e interrupción de servidor exitosa');
  process.exit();
});
