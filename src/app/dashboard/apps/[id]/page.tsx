import { auth } from "@/app/api/auth/[...nextauth]/auth-options";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import SendTestMessage from "./_components/SendMessage";
import SendMessageButton from "./_components/SendMessage";

interface BotDetailPageProps {
  params: { id: string };
}

export default async function BotDetailPage({ params }: BotDetailPageProps) {
  const session = await auth();
  if (!session?.user) return notFound();

  const app = await prisma.app.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!app) return notFound();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Bot: {app.name}</h1>

      <p><strong>Token:</strong> {app.botToken.slice(0, 12)}•••</p>

      {app.miniAppUrl && (
        <p>
          <strong>Mini App URL:</strong>{" "}
          <a href={app.miniAppUrl} className="text-blue-500 underline" target="_blank">
            {app.miniAppUrl}
          </a>
        </p>
      )}



<SendMessageButton
  botToken={app.botToken}
  
  webAppUrl={app.miniAppUrl!}
/>
    </main>
  );
}