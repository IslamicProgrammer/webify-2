import { NextResponse } from 'next/server';

import { sendTelegramMessage } from '@/lib/telegram/sendTelegramMessage';

export async function POST(req: Request) {
  const { botToken, chatId, message, webAppUrl } = await req.json();

  const ok = await sendTelegramMessage({
    botToken,
    chatId,
    message,
    webAppUrl
  });

  return NextResponse.json({ ok });
}
