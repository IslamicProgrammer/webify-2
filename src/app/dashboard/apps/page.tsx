import Link from 'next/link';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export default async function AppsListPage() {
  const session = await auth();

  if (!session?.user) return null;

  const apps =
    (await prisma.app.findMany({
      where: { userId: session.user.id }
    })) || [];

  return (
    <main className="p-4">
      <h1 className="mb-4 text-xl font-bold">Your Telegram Bots</h1>

      <Link href="/dashboard/apps/new" className="mb-4 inline-block text-blue-600 underline">
        + Create New Bot
      </Link>

      <ul className="space-y-4">
        {apps.map(app => (
          <li key={app.id} className="rounded border p-4">
            <h2 className="text-lg font-semibold">{app.name}</h2>
            <p className="text-sm">Bot Token: {app.botToken.slice(0, 16)}...</p>
            <Link href={`/dashboard/apps/${app.id}`} className="text-blue-500">
              Manage
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
