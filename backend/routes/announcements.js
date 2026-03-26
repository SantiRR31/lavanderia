const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get active announcements (client facing)
router.get('/', async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { active: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get ALL announcements for admin
router.get('/all', async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create announcement
router.post('/', async (req, res) => {
    try {
        const { title, description, imageUrl, active } = req.body;
        const announcement = await prisma.announcement.create({
            data: {
                title,
                description,
                imageUrl,
                active: active !== undefined ? active : true
            }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update announcement
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, active } = req.body;
        const announcement = await prisma.announcement.update({
            where: { id: parseInt(id) },
            data: { title, description, imageUrl, active }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle active status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({ where: { id: parseInt(id) } });
        const updated = await prisma.announcement.update({
            where: { id: parseInt(id) },
            data: { active: !announcement.active }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
