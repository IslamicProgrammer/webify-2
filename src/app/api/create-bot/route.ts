import { NextResponse } from 'next/server';
import slugify from 'slugify';

import prisma from '@/lib/prisma';
import { auth } from '@/server/auth';

export async function POST(req: Request) {
  // Get the session of the currently authenticated user
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Get the bot name and token from the request body
  const { name, token } = await req.json();

  // Check if both name and token are provided
  if (!name || !token) {
    return NextResponse.json({ ok: false, error: 'Missing name or token' }, { status: 400 });
  }

  // Generate the bot slug from the name
  const slug = slugify(name, { lower: true });

  try {
    // Create the new bot entry in the database
    const app = await prisma.app.create({
      data: {
        name,
        botToken: token,
        slug,
        miniAppUrl: `${process.env.APP_URL}/mini/${slug}`,
        userId: session.user.id
      }
    });

    // Respond with the created bot details
    return NextResponse.json({ ok: true, id: app.id });
  } catch (err) {
    // Handle any errors during the creation process
    return NextResponse.json({ ok: false, error: 'Bot already exists or DB error.' }, { status: 500 });
  }
}
