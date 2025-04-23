'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/use-toast';

export default function NewBotPage() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  // Setup webhook after bot creation
  async function setupBotWebhook(botToken: string, botId: string) {
    const webhookUrl = `https://e803-146-158-94-68.ngrok-free.app/webhook/${botId}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true
      })
    });

    const data = await response.json();

    return data;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation for fields
    if (!name || !token) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please provide both a bot name and token.'
      });
      return;
    }

    startTransition(async () => {
      // Validate the bot token with Telegram
      const validate = await fetch('/api/validate-bot', {
        method: 'POST',
        body: JSON.stringify({ botToken: token })
      });

      const validationResult = await validate.json();

      if (!validationResult.ok) {
        toast({
          variant: 'destructive',
          title: 'Invalid Token',
          description: 'The BotFather token you entered is not valid.'
        });
        return;
      }

      // Save the bot in the database
      const save = await fetch('/api/create-bot', {
        method: 'POST',
        body: JSON.stringify({ name, token })
      });

      const result = await save.json();

      if (result.ok && result.id) {
        const botId = result.id;

        // Setup webhook after bot creation
        const res = await setupBotWebhook(token, botId);

        if (!res.ok) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: res.description ?? 'Webhook error'
          });
          return;
        }
        toast({
          title: 'Bot created!',
          description: `${name} is ready 🎉`
        });

        router.push(`/dashboard/apps/${botId}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error ?? 'Failed to create bot.'
        });
      }
    });
  };

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create a New Telegram Bot</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Bot Name</label>
          <input className="w-full rounded border px-3 py-2" value={name} onChange={e => setName(e.target.value)} placeholder="My Store Bot" />
        </div>

        <div>
          <label className="block text-sm font-medium">BotFather Token</label>
          <input className="w-full rounded border px-3 py-2" value={token} onChange={e => setToken(e.target.value)} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
        </div>

        <button type="submit" disabled={isPending} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
          {isPending ? 'Creating...' : 'Create Bot'}
        </button>
      </form>
    </main>
  );
}
