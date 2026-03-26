const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    // 1. Seed Services
    const services = [
        { name: 'Camisa', price: 25.00 },
        { name: 'Pantalon', price: 30.00 },
        { name: 'Playera', price: 20.00 },
        { name: 'Vestido', price: 80.00 },
        { name: 'Sabana', price: 45.00 },
        { name: 'Cobija', price: 120.00 },
        { name: 'Edredon', price: 150.00 },
        { name: 'Chamarra', price: 60.00 },
        { name: 'Traje', price: 180.00 },
    ];

    for (const s of services) {
        await prisma.service.upsert({
            where: { name: s.name },
            update: { price: s.price },
            create: { name: s.name, price: s.price },
        });
    }
    console.log('Servicios sembrados correctamente');

    // 2. Seed Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
        },
    });
    console.log('Usuario Admin creado correctamente');
    console.log('User: admin');
    console.log('Pass: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
