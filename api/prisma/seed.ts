import 'dotenv/config';
import { PrismaClient, CampaignStatus, TransportEventType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (password: string) => bcrypt.hash(password, 12);

async function main() {
  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 86400000);
  const future = (days: number) => new Date(now.getTime() + days * 86400000);

  // --- Users ---
  const [admin, donor1, donor2, transporterUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@sistratec.com',
        passwordHash: await hash('Admin123'),
        name: 'Admin Centro',
        role: 'ADMIN_CENTER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'donante1@example.com',
        passwordHash: await hash('Donor123'),
        name: 'María González',
        role: 'DONOR',
      },
    }),
    prisma.user.create({
      data: {
        email: 'donante2@example.com',
        passwordHash: await hash('Donor123'),
        name: 'Carlos Rodríguez',
        role: 'DONOR',
      },
    }),
    prisma.user.create({
      data: {
        email: 'transportista@example.com',
        passwordHash: await hash('Trans123'),
        name: 'Luis Herrera',
        role: 'TRANSPORTER',
      },
    }),
  ]);

  const transporter = await prisma.transporter.create({
    data: {
      userId: transporterUser.id,
      vehicle: 'Camión Isuzu 3.5t',
      plate: 'ABC1234',
    },
  });

  // --- Campaigns ---
  const [campOpen, campFrozen, campClosed, campInTransit, campDelivered] = await Promise.all([
    prisma.campaign.create({
      data: {
        name: 'Ayuda Invernal 2025',
        description: 'Campaña de recolección de ropa y alimentos para familias afectadas por el invierno.',
        status: CampaignStatus.OPEN,
        startDate: past(5),
        endDate: future(25),
        categories: ['Ropa', 'Alimentos'],
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Apoyo Escolar Zona Central',
        description: 'Útiles escolares y mochilas para niños de comunidades de escasos recursos.',
        status: CampaignStatus.FROZEN,
        startDate: past(20),
        endDate: future(10),
        categories: ['Educación'],
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Alimentos Básicos Región Caribe',
        description: 'Canastas de alimentos no perecederos para familias en la región Caribe.',
        status: CampaignStatus.CLOSED,
        startDate: past(40),
        endDate: past(10),
        categories: ['Alimentos'],
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Medicamentos Región Norte',
        description: 'Medicamentos y suministros médicos básicos para clínicas rurales del norte.',
        status: CampaignStatus.IN_TRANSIT,
        startDate: past(50),
        endDate: past(20),
        categories: ['Salud'],
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Reconstrucción Hogar Zona Sur 2024',
        description: 'Materiales de construcción para familias que perdieron sus viviendas por lluvias.',
        status: CampaignStatus.DELIVERED,
        startDate: past(100),
        endDate: past(70),
        categories: ['Construcción', 'Vivienda'],
      },
    }),
  ]);

  // --- Donations ---
  await prisma.donation.create({
    data: {
      campaignId: campOpen.id,
      donorId: donor1.id,
      note: 'Ropa de invierno en buen estado, lavada y doblada.',
      items: {
        create: [
          { description: 'Abrigos de adulto', quantity: 5 },
          { description: 'Suéteres de niño', quantity: 8 },
          { description: 'Botas de lluvia', quantity: 3 },
        ],
      },
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campOpen.id,
      donorId: donor2.id,
      items: {
        create: [
          { description: 'Arroz (kg)', quantity: 10 },
          { description: 'Frijoles (kg)', quantity: 5 },
          { description: 'Aceite vegetal (litros)', quantity: 4 },
          { description: 'Azúcar (kg)', quantity: 3 },
        ],
      },
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campClosed.id,
      donorId: donor1.id,
      status: 'RECEIVED',
      items: {
        create: [
          { description: 'Arroz (kg)', quantity: 20 },
          { description: 'Pasta (paquetes)', quantity: 15 },
        ],
      },
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campInTransit.id,
      donorId: donor1.id,
      status: 'IN_TRANSIT',
      note: 'Medicamentos dentro de su fecha de vencimiento.',
      items: {
        create: [
          { description: 'Ibuprofeno 400mg (cajas)', quantity: 20 },
          { description: 'Suero oral (bolsas)', quantity: 15 },
          { description: 'Vendas elásticas', quantity: 10 },
        ],
      },
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campInTransit.id,
      donorId: donor2.id,
      status: 'IN_TRANSIT',
      items: {
        create: [
          { description: 'Paracetamol 500mg (cajas)', quantity: 30 },
          { description: 'Alcohol antiséptico (litros)', quantity: 5 },
        ],
      },
    },
  });

  await prisma.donation.create({
    data: {
      campaignId: campDelivered.id,
      donorId: donor2.id,
      status: 'DELIVERED',
      note: 'Materiales nuevos adquiridos en ferretería.',
      items: {
        create: [
          { description: 'Láminas de zinc', quantity: 12 },
          { description: 'Cemento (sacos)', quantity: 8 },
          { description: 'Varillas de hierro', quantity: 20 },
        ],
      },
    },
  });

  // --- Transport assignment — IN_TRANSIT ---
  const assignmentInTransit = await prisma.transportAssignment.create({
    data: {
      campaignId: campInTransit.id,
      transporterId: transporter.id,
      destination: 'Clínica Rural San Isidro, Región Norte',
      distanceKm: 185,
      departureDate: past(3),
      estimatedArrival: future(1),
    },
  });

  await prisma.transportEvent.createMany({
    data: [
      {
        assignmentId: assignmentInTransit.id,
        type: TransportEventType.TRUCK_DEPARTED,
        description: 'Salida desde centro de acopio principal',
        notes: 'Carga verificada y sellada. Temperatura ambiente correcta.',
        occurredAt: past(3),
      },
      {
        assignmentId: assignmentInTransit.id,
        type: TransportEventType.CHECKPOINT,
        description: 'Checkpoint Ruta 32 — km 80',
        notes: 'Revisión rutinaria completada sin novedades.',
        occurredAt: past(2),
      },
      {
        assignmentId: assignmentInTransit.id,
        type: TransportEventType.TECHNICAL_STOP,
        description: 'Parada técnica en Turrialba',
        notes: 'Revisión preventiva de frenos. 45 minutos de retraso.',
        occurredAt: past(1),
      },
    ],
  });

  // --- Transport assignment — DELIVERED ---
  const assignmentDelivered = await prisma.transportAssignment.create({
    data: {
      campaignId: campDelivered.id,
      transporterId: transporter.id,
      destination: 'Comunidad Los Pinos, Zona Sur',
      distanceKm: 220,
      departureDate: past(68),
      estimatedArrival: past(65),
    },
  });

  await prisma.transportEvent.createMany({
    data: [
      {
        assignmentId: assignmentDelivered.id,
        type: TransportEventType.TRUCK_DEPARTED,
        description: 'Salida desde bodega central',
        notes: 'Carga asegurada y documentación en regla.',
        occurredAt: past(68),
      },
      {
        assignmentId: assignmentDelivered.id,
        type: TransportEventType.CHECKPOINT,
        description: 'Checkpoint km 110 — Ruta 2',
        occurredAt: past(67),
      },
      {
        assignmentId: assignmentDelivered.id,
        type: TransportEventType.ARRIVED_AT_DESTINATION,
        description: 'Llegada a Comunidad Los Pinos',
        notes: 'Entrega completada. Recibido por representante comunal.',
        occurredAt: past(65),
      },
    ],
  });

  // --- Inventory ---
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Arroz', category: 'Alimentos', quantity: 150, unit: 'kg' },
      { name: 'Frijoles', category: 'Alimentos', quantity: 80, unit: 'kg' },
      { name: 'Aceite vegetal', category: 'Alimentos', quantity: 30, unit: 'litros' },
      { name: 'Ropa de adulto', category: 'Ropa', quantity: 45, unit: 'unidades' },
      { name: 'Ropa de niño', category: 'Ropa', quantity: 60, unit: 'unidades' },
      { name: 'Ibuprofeno 400mg', category: 'Medicamentos', quantity: 200, unit: 'cajas' },
      { name: 'Paracetamol 500mg', category: 'Medicamentos', quantity: 150, unit: 'cajas' },
      { name: 'Cemento', category: 'Construcción', quantity: 30, unit: 'sacos' },
      { name: 'Útiles escolares', category: 'Educación', quantity: 40, unit: 'kits' },
    ],
  });

  console.log('Seed complete.');
  console.log('');
  console.log('Credentials:');
  console.log('  admin@sistratec.com        Admin123  (ADMIN_CENTER)');
  console.log('  donante1@example.com       Donor123  (DONOR)');
  console.log('  donante2@example.com       Donor123  (DONOR)');
  console.log('  transportista@example.com  Trans123  (TRANSPORTER)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
