/* eslint-disable no-alert */

'use client';

import { useTransition } from 'react';

interface Props {
  botToken: string;
  slug: string;
}

export default function SendMessageButton({ botToken, slug }: Props) {
  const [isPending, startTransition] = useTransition();

  const sendMessage = async () => {
    startTransition(async () => {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        body: JSON.stringify({
          botToken,
          chatId: 872208636,
          message: '🚀 Hello from your Mini Web App!',
          webAppUrl: `  /mini/${slug}`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Open Mini App',
                  web_app: { url: `https://webify-2.vercel.app/mini/${slug}` }
                }
              ]
            ]
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.ok) {
        alert('✅ Message sent to Telegram!');
      } else {
        alert('❌ Failed to send message.');
      }
    });
  };

  return (
    <button onClick={sendMessage} disabled={isPending} className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50">
      {isPending ? 'Sending...' : 'Send Message to Telegram'}
    </button>
  );
}
