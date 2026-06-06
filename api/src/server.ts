import { app } from "./app";
import { env } from "./config/env";
import { startAutoCloseCampaigns } from "./jobs/autoCloseCampaigns";

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  startAutoCloseCampaigns();
});
