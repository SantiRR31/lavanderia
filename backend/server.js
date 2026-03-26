const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
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
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
