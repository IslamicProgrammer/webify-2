import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { botToken } = await req.json();

  if (!botToken) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();

    if (!data.ok) {
      return NextResponse.json({ ok: false, error: "Invalid bot token" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, bot: data.result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to validate bot" }, { status: 500 });
  }
}