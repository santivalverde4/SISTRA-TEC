import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando la siembra de datos...')

  // Crear items de inventario primero
  const arroz = await prisma.inventoryItem.upsert({
    where: { name: 'Arroz' },
    update: {},
    create: {
      name: 'Arroz',
      category: 'Alimentos',
      unit: 'kg',
      quantity: 0,
    },
  })

  const frijoles = await prisma.inventoryItem.upsert({
    where: { name: 'Frijoles' },
    update: {},
    create: {
      name: 'Frijoles',
      category: 'Alimentos',
      unit: 'kg',
      quantity: 0,
    },
  })

  const ropa = await prisma.inventoryItem.upsert({
    where: { name: 'Ropa' },
    update: {},
    create: {
      name: 'Ropa',
      category: 'Ropa',
      unit: 'unidades',
      quantity: 0,
    },
  })

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

  // Crear usuario Donante
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

  // Crear otra usuario Donante para pruebas
  const donante2 = await prisma.user.upsert({
    where: { email: 'maria@gmail.com' },
    update: {},
    create: {
      email: 'maria@gmail.com',
      name: 'María García',
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
    },
  })

  // Mostrar los IDs necesarios para los curls

  console.log(`Campaign ID: ${campaña.id}`)
  console.log(`Donor ID (Juan): ${donante.id}`)
  console.log(`Donor ID (María): ${donante2.id}`)
  console.log(`- Arroz (ID: ${arroz.id})`)
  console.log(`- Frijoles (ID: ${frijoles.id})`)
  console.log(`- Ropa (ID: ${ropa.id})`)
  console.log('\n')

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })