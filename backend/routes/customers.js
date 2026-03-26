const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

// Create or find customer by phone
router.post('/', async (req, res) => {
    const { name, phone } = req.body;
    try {
        let customer = await prisma.customer.findUnique({
            where: { phone }
        });
        if (!customer) {
            customer = await prisma.customer.create({
                data: { name, phone }
            });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                orders: {
                    select: {
                        price: true,
                        created_at: true
                    }
                }
            }
        });

        const detailedCustomers = customers.map(c => {
            const totalSpend = c.orders.reduce((sum, order) => sum + parseFloat(order.price), 0);
            const lastVisit = c.orders.length > 0 
                ? c.orders.reduce((latest, order) => 
                    order.created_at > latest ? order.created_at : latest, c.orders[0].created_at)
                : null;

            return {
                id: c.id,
                name: c.name,
                phone: c.phone,
                orderCount: c.orders.length,
                totalSpend: totalSpend.toFixed(2),
                lastVisit
            };
        });

        res.json(detailedCustomers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit customer
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;
    try {
        const updated = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: { name, phone }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete customer
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Since schema doesn't have cascade delete, delete customer orders first.
        await prisma.order.deleteMany({ where: { customer_id: parseInt(id) } });
        await prisma.customer.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Customer and related orders deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
