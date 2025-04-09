import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '../api/auth/[...nextauth]/auth-options';

// or wherever you export your Prisma client

export const runtime = 'nodejs';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect('/');

  async function saveToken(formData: FormData) {
    'use server';
    const token = formData.get('token') as string;

    revalidatePath('/dashboard');
  }

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Telegram Bot</h1>

      <form action={saveToken} className="space-y-4">
        <input name="token" placeholder="Paste BotFather token here" className="w-full rounded border px-3 py-2" defaultValue={session.user.telegramBotToken ?? ''} />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Bot Token
        </button>
      </form>
    </main>
  );
}
