export async function sendTelegramMessage({
  botToken,
  chatId,
  message,
  webAppUrl
}: {
  botToken: string;
  chatId: string | number;
  message: string;
  webAppUrl?: string;
}): Promise<boolean> {
  const payload: Record<string, any> = {
    chat_id: chatId,
    text: message
  };

  if (webAppUrl) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          {
            text: 'Open Mini App',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    return data.ok;
  } catch (err) {
    return false;
  }
}
