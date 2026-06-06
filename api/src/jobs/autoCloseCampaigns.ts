import { prisma } from '../db/prisma';

const INTERVAL_MS = 60 * 60 * 1000; // run every hour

async function closeExpiredCampaigns(): Promise<void> {
  const now = new Date();

  const { count } = await prisma.campaign.updateMany({
    where: {
      status: { in: ['OPEN', 'FROZEN'] },
      endDate: { lt: now },
    },
    data: { status: 'CLOSED' },
  });

  if (count > 0) {
    console.log(`[autoCloseCampaigns] Closed ${count} expired campaign(s).`);
  }
}

export function startAutoCloseCampaigns(): void {
  // Run immediately on startup, then on every interval
  closeExpiredCampaigns().catch((err) =>
    console.error('[autoCloseCampaigns] Error on startup run:', err)
  );

  setInterval(() => {
    closeExpiredCampaigns().catch((err) =>
      console.error('[autoCloseCampaigns] Error on scheduled run:', err)
    );
  }, INTERVAL_MS);
}
