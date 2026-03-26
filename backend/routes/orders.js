const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

// Ticket number generator utility
const generateTicketNumber = (customerName) => {
    const date = new Date();
    const datePart = date.getFullYear().toString().slice(-2) +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');

    // Get initials (first letter of each word, max 3)
    const initials = customerName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

    const randomPart = Math.random().toString(36).substr(2, 2).toUpperCase();

    return `T-${datePart}-${initials}-${randomPart}`;
}

// Create order
router.post('/', async (req, res) => {
    const { customer_id, service_type, garments_count, price, estimated_delivery } = req.body;
    try {
        // Fetch customer to get the name for initials
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customer_id) }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const ticket_number = generateTicketNumber(customer.name);
        const order = await prisma.order.create({
            data: {
                ticket_number,
                customer_id: parseInt(customer_id),
                service_type,
                garments_count: parseInt(garments_count),
                price: parseFloat(price),
                estimated_delivery: estimated_delivery ? new Date(`${estimated_delivery}T12:00:00`) : null,
                status: 'Recibido'
            },
            include: { customer: true }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders (with optional filters and pagination)
router.get('/', async (req, res) => {
    const { query, page = 1, limit = 10, status } = req.query;
    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const filters = {};
        if (query) {
            filters.OR = [
                { ticket_number: { contains: query, mode: 'insensitive' } },
                { customer: { phone: { contains: query } } }
            ];
        }

        if (status && status !== 'Todos') {
            if (status === 'Pendientes') {
                filters.status = { in: ['Recibido', 'En proceso'] };
            } else if (status === 'Listos') {
                filters.status = 'Listo para recoger';
            } else if (status === 'Entregados') {
                filters.status = 'Entregado';
            }
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: filters,
                include: { customer: true },
                orderBy: { created_at: 'desc' },
                skip,
                take
            }),
            prisma.order.count({ where: filters })
        ]);

        res.json({
            orders,
            total,
            totalPages: Math.ceil(total / take),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single order for tracking (public)
router.get('/:ticket_number', async (req, res) => {
    const { ticket_number } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: { ticket_number },
            include: { customer: true }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status/data
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, delivered_date } = req.body;
    try {
        const data = { status };
        if (status === 'Entregado') {
            data.delivered_date = new Date();
        }
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
