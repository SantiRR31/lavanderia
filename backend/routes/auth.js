const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET || "super-secret-key", { expiresIn: '1h' });
            
            // Set Secure and HttpOnly Cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600000 // 1 hour
            });

            logger.info('Inicio de sesión exitoso', { username: user.username, ip: clientIp });
            res.json({ username: user.username });
        } else {
            logger.warn('Intento fallido de inicio de sesión', { username, ip: clientIp });
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    } catch (error) {
        logger.error('Error durante el inicio de sesión', { error: error.message, stack: error.stack, username, ip: clientIp });
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Logout endpoint to clear secure cookie
router.post('/logout', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let username = 'desconocido';
    
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.decode(req.cookies.token);
            if (decoded) {
                username = decoded.username;
            }
        } catch (e) {
            // ignore decoding error on logout
        }
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    logger.info('Cierre de sesión exitoso', { username, ip: clientIp });
    res.json({ message: "Sesión cerrada correctamente" });
});

// Middleware for auth check
const authMiddleware = (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Attempt to read token from cookies first, fallback to Authorization header
    let token = req.cookies ? req.cookies.token : null;
    if (!token) {
        token = req.headers['authorization'];
    }

    if (!token) {
        logger.warn('Acceso denegado: Token no proporcionado', { ip: clientIp, path: req.originalUrl });
        return res.status(401).json({ error: "No autorizado" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "super-secret-key", (err, decoded) => {
        if (err) {
            logger.warn('Acceso denegado: Token inválido o expirado', { ip: clientIp, path: req.originalUrl });
            return res.status(403).json({ error: "Prohibido" });
        }
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
        logger.error('Error al obtener lista de administradores', { error: error.message, requestedBy: req.user.username });
        res.status(500).json({ error: "Error al obtener administradores" });
    }
});

// Create new admin - Protected route
router.post('/register', authMiddleware, async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword }
        });
        
        logger.info('Registro de nuevo administrador', { 
            creator: req.user.username, 
            newAdmin: newUser.username, 
            ip: clientIp 
        });

        res.json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
        logger.error('Error al registrar administrador', { 
            error: error.message, 
            requestedBy: req.user.username,
            ip: clientIp 
        });
        res.status(500).json({ error: "Error al crear administrador" });
    }
});

// Delete an admin - Protected route
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const userToDelete = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
        if (!userToDelete) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await prisma.user.delete({ where: { id: parseInt(id) } });

        logger.info('Eliminación de administrador', { 
            deletedBy: req.user.username, 
            deletedAdmin: userToDelete.username, 
            ip: clientIp 
        });

        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        logger.error('Error al eliminar administrador', { 
            error: error.message, 
            requestedBy: req.user.username, 
            targetId: id,
            ip: clientIp 
        });
        res.status(500).json({ error: "Error al eliminar administrador" });
    }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
