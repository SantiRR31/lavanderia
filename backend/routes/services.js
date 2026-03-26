const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
