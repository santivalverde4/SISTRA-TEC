import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in dependency order (children before parents)
  await prisma.transportEvent.deleteMany();
  await prisma.transportAssignment.deleteMany();
  await prisma.donationHistory.deleteMany();
  await prisma.donationItem.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oauthAccount.deleteMany();
  await prisma.transporter.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database reset complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
