'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/use-toast';
// import { trpc } from '@/utils/trpc';

export default function NewBotPage() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  // const createMutation = trpc.createBot.useMutation();

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
    //
    // createMutation.mutate({
    //   botToken: token,
    //   name
    // });

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
        toast({
          title: 'Bot created!',
          description: `${name} is ready 🎉`
        });
        router.push(`/dashboard/apps/${result.id}`);
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
