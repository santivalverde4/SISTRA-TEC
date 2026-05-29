import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando la siembra de datos...')

  // Crear usuario Administrador
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      name: 'Administrador Central',
      passwordHash: 'fake_hash_123', // Esto hay que actualizar cuando se implemente el hashing real
      role: 'ADMIN_CENTER',
    },
  })

  // Crear usuario Transportista con su perfil de Transporter de una vez
  const transportista = await prisma.user.upsert({
    where: { email: 'chofer@rutas.cr' },
    update: {},
    create: {
      email: 'chofer@rutas.cr',
      name: 'Transportes El Tejar',
      passwordHash: 'fake_hash_123',
      role: 'TRANSPORTER',
      transporter: {
        create: {
          vehicle: 'Camión Isuzu',
          plate: 'C-123456',
        },
      },
    },
  })

  // Crear usuario Donante y una Campaña con Donaciones
  const donante = await prisma.user.upsert({
    where: { email: 'donante@gmail.com' },
    update: {},
    create: {
      email: 'donante@gmail.com',
      name: 'Juan Pérez',
      passwordHash: 'fake_hash_123',
      role: 'DONOR',
    },
  })

  const campaña = await prisma.campaign.create({
    data: {
      name: 'Recolección Zona Norte',
      description: 'Campaña de recolección de víveres y ropa.',
      status: 'OPEN',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Un mes a partir de hoy
      categories: ['Alimentos', 'Ropa', 'Medicinas'],
      donations: {
        create: [
          {
            donorId: donante.id,
            note: 'Dejo esto en la entrada',
            items: {
              create: [
                { description: 'Arroz y Frijoles', quantity: '5 kg' },
                { description: 'Ropa de invierno', quantity: '3 bolsas' },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Base de datos poblada con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })