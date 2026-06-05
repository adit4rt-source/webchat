// Bot API client — used in server-side API routes to proxy requests to bot
const BOT_API_URL = process.env.BOT_API_URL || "http://basic-4.alstore.space:25922";
const BOT_API_KEY = process.env.BOT_API_KEY || "";

interface FetchOptions {
  method?: string;
  body?: any;
  userId?: string;
}

export async function botApi(path: string, options: FetchOptions = {}) {
  const { method = "GET", body, userId } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": BOT_API_KEY,
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(`${BOT_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || error.message || `API Error ${res.status}`);
  }

  return res.json();
}
