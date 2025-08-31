// netlify/functions/timelines.js
export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const apiKey = process.env.TIO_KEY;
  if (!apiKey) {
    return new Response("Server not configured: missing TIO_KEY", { status: 500 });
  }
  try {
    const body = await request.json();
    const resp = await fetch("https://api.tomorrow.io/v4/timelines", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body: JSON.stringify(body)
    });
    const text = await resp.text();
    return new Response(text, { status: resp.status, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(`Proxy error: ${err}`, { status: 500 });
  }
};