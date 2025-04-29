'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function NewBotPage() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  async function setupBotWebhook(botToken: string, botId: string) {
    const webhookUrl = `${process.env.SERVER_URL}/webhook/${botId}`;
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true })
    });

    return response.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !token) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please provide both a bot name and token.'
      });
      return;
    }

    startTransition(async () => {
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

      const save = await fetch('/api/create-bot', {
        method: 'POST',
        body: JSON.stringify({ name, token })
      });

      const result = await save.json();

      if (result.ok && result.id) {
        const botId = result.id;
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
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Create a New Telegram Bot</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border p-6 shadow-sm">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Bot Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Store Bot"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">BotFather Token</label>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button type="submit" disabled={isPending} className={cn(buttonVariants({ variant: 'default' }), 'ml-auto disabled:opacity-60')}>
          {isPending ? 'Creating...' : 'Create Bot'}
        </button>
      </form>
    </main>
  );
}
