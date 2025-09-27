import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const telegramToken = process.env.NEXT_PUBLIC_TOKEN;
  const telegramChatId = process.env.NEXT_PUBLIC_ID;
  const telegramChatId2 = process.env.NEXT_PUBLIC_ID2;

  // Send to first chat ID
  const res1 = await fetch(
    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: "Markdown",
      }),
    }
  );

  // Send to second chat ID
  const res2 = await fetch(
    `https://api.telegram.org/bot${telegramToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId2,
        text: message,
        parse_mode: "Markdown",
      }),
    }
  );

  // Return response from the first chat ID (consistent with original behavior)
  const data = await res1.json();
  return NextResponse.json(data);
}