import { sendTelegramMessage } from "../src/lib/telegram";

async function main() {
  await sendTelegramMessage("✅ Score Telegram notification test");
  console.log("Telegram test notification attempted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
