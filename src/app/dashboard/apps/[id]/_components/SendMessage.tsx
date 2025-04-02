'use client';

import { useTransition } from "react";

interface Props {
  botToken: string;
}

export default function SendMessageButton({ botToken }: Props) {
  const [isPending, startTransition] = useTransition();

  const sendMessage = async () => {
    startTransition(async () => {
      const res = await fetch("/api/send-message", {
        method: "POST",
        body: JSON.stringify({
          botToken,
          chatId: 872208636,
          message: "🚀 Hello from your Mini Web App!",
          webAppUrl: "https://google.com",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("✅ Message sent to Telegram!");
      } else {
        alert("❌ Failed to send message.");
      }
    });
  };

  return (
    <button
      onClick={sendMessage}
      disabled={isPending}
      className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {isPending ? "Sending..." : "Send Message to Telegram"}
    </button>
  );
}