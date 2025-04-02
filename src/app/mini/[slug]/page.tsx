import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

// interface MiniAppPageProps {
//   params: { slug: string };
// }

export const runtime = "nodejs";

export default async function MiniAppPage({ params }: any) {
  const app = await prisma.app.findUnique({
    where: { slug: params.slug },
  });

  if (!app) {
    notFound();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">👋 Hello from Mini App!</h1>
        <p className="text-lg">This is for <strong>{app.name}</strong></p>
        <p className="text-sm text-gray-500">Slug: <code>{app.slug}</code></p>
      </div>
    </main>
  );
}