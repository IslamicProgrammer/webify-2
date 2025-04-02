import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '../api/auth/[...nextauth]/auth-options';

import prisma from '@/lib/prisma'; // or wherever you export your Prisma client

export const runtime = 'nodejs';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  async function saveToken(formData: FormData) {
    'use server';
    const token = formData.get('token') as string;

    await prisma.user.update({
      where: { id: session?.user.id },
      data: { telegramBotToken: token },
    });

    revalidatePath('/dashboard');
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Telegram Bot</h1>

      <form action={saveToken} className="space-y-4">
        <input
          name="token"
          placeholder="Paste BotFather token here"
          className="w-full rounded border px-3 py-2"
          defaultValue={session.user.telegramBotToken ?? ''}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Save Bot Token
        </button>
      </form>
    </main>
  );
}
