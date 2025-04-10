import { notFound } from 'next/navigation';

import SendMessageButton from './_components/SendMessage';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export default async function BotDetailPage({ params }: any) {
  const session = await auth();

  if (!session?.user) return notFound();

  const app = await prisma.app.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    }
  });

  if (!app) return notFound();

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Bot: {app.name}</h1>

      <p>
        <strong>Token:</strong> {app.botToken.slice(0, 12)}•••
      </p>

      {app.miniAppUrl && (
        <p>
          <strong>Mini App URL:</strong>{' '}
          <a href={app.miniAppUrl} className="text-blue-500 underline" target="_blank">
            {app.miniAppUrl}
          </a>
        </p>
      )}

      <SendMessageButton slug={app.slug} botToken={app.botToken} />
    </main>
  );
}
