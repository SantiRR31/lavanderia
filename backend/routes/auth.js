const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
require('dotenv').config();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "super-secret-key", { expiresIn: '1h' });
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Middleware for auth check
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, process.env.JWT_SECRET || "super-secret-key", (err, decoded) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = decoded;
        next();
    });
};

// Get all admins (users) - Protected route
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await prisma.user.findMany({ select: { id: true, username: true } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new admin - Protected route
router.post('/register', authMiddleware, async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword }
        });
        res.json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        // Handle unique constraint error (e.g. username already exists)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete an admin - Protected route
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
