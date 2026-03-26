const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const { authMiddleware } = require('./auth');

router.get('/summary', authMiddleware, async (req, res) => {
    try {
        // 1. Basic KPIs
        const totalOrders = await prisma.order.count();
        const activeOrders = await prisma.order.count({
            where: { status: { not: 'Entregado' } }
        });
        
        const numericStats = await prisma.order.aggregate({
            _sum: {
                price: true,
                garments_count: true
            }
        });
        
        const totalIncome = numericStats._sum.price || 0;
        const totalGarments = numericStats._sum.garments_count || 0;

        // 2. Service Distribution (for Pie Chart)
        const servicesGroup = await prisma.order.groupBy({
            by: ['service_type'],
            _count: { id: true }
        });

        // Fetch all orders for memory calculations (Top customers, Revenue Over Time)
        const allOrders = await prisma.order.findMany({
            include: { customer: true }
        });

        // 3. Top Customers
        const customerSpend = {};
        allOrders.forEach(order => {
            if (!customerSpend[order.customer.id]) {
                customerSpend[order.customer.id] = {
                    id: order.customer.id,
                    name: order.customer.name,
                    phone: order.customer.phone,
                    total: 0
                };
            }
            customerSpend[order.customer.id].total += parseFloat(order.price);
        });

        const topCustomers = Object.values(customerSpend)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // 4. Overdue/Delayed Orders
        const now = new Date();
        const overdueOrders = await prisma.order.findMany({
            where: {
                status: { not: 'Entregado' },
                estimated_delivery: { lt: now }
            },
            include: { customer: true },
            take: 10,
            orderBy: { estimated_delivery: 'asc' }
        });

        // 5. Upcoming Orders
        const upcomingOrders = await prisma.order.findMany({
            where: {
                status: { not: 'Entregado' },
                estimated_delivery: { gte: now }
            },
            include: { customer: true },
            take: 10,
            orderBy: { estimated_delivery: 'asc' }
        });

        // 6. Revenue by Date (for Bar/Line Chart)
        const revenueByDateObj = {};
        allOrders.forEach(order => {
            const dateStr = new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); 
            if(!revenueByDateObj[dateStr]) revenueByDateObj[dateStr] = 0;
            revenueByDateObj[dateStr] += parseFloat(order.price);
        });

        // Convert obj to keeping chronological order
        // We use the original object keys which might not be perfectly standard sorted if months cross, 
        // but for a simple local system it works well enough.
        const revenueByDate = Object.keys(revenueByDateObj).map(date => ({
            date,
            amount: revenueByDateObj[date]
        }));

        res.json({
            kpis: {
                totalOrders,
                activeOrders,
                totalIncome,
                totalGarments
            },
            serviceDistribution: servicesGroup.map(s => ({
                name: s.service_type,
                value: s._count.id
            })),
            topCustomers,
            overdueOrders,
            upcomingOrders,
            revenueByDate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
