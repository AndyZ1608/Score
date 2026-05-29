const TELEGRAM_TIMEOUT_MS = 5000;

export async function sendTelegramMessage(message: string): Promise<void> {
  const enabled = process.env.TELEGRAM_NOTIFY_REGISTRATION === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!enabled || !token || !chatId) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error("Telegram notification failed:", response.status);
    }
  } catch {
    console.error("Telegram notification error");
  } finally {
    clearTimeout(timeout);
  }
}
