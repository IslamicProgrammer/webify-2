import Link from 'next/link';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import { buttonVariants } from '@/components/ui/button';
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
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Your Telegram Bots</h1>

        <Link href="/dashboard/apps/new" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          + Create New Bot
        </Link>
      </div>

      <ul className="space-y-4">
        {apps.map(app => (
          <li key={app.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{app.name}</h2>
              <Link href={`/dashboard/apps/${app.id}`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                Manage
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Bot Token: <span className="font-mono">{app.botToken.slice(0, 16)}...</span>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
