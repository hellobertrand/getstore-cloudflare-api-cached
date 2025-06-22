/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env): Promise<Response> {
    console.log("Request URL:", request.url);
    const url = new URL(request.url);

    let params = "";
    let format = "";
    let ext = "";
    let query = "";
    let bufferedBody: ArrayBuffer | undefined = undefined;

    if (!["GET", "POST"].includes(request.method)) {
      return fetch(request);
    }

    if (request.method === "GET") {
      query = url.search.startsWith("?") ? url.search.slice(1) : url.search;
    } else if (request.method === "POST") {
      // Buffer the body so it can be reused
      bufferedBody = await request.arrayBuffer();
      const textBody = new TextDecoder().decode(bufferedBody);
      let payload: Record<string, any> = {};
      try {
        payload = JSON.parse(textBody);
      } catch (e) {
        // fallback for non-JSON bodies
      }
      query = new URLSearchParams(payload).toString();
    }

    if (query.includes("cache=true")) {
      const searchParams = new URLSearchParams(query);
      format = searchParams.get("format") || "";
      params = decodeURIComponent(query);
    }

    if (params) {
      console.log("params", params);

      switch (url.pathname) {
        case "/v1/screenshot":
          ext = format || "jpeg";
          break;
        case "/v1/pdf":
          ext = "pdf";
          break;
        case "/v1/screencast":
          ext = format || "mp4";
          break;
        case "/v1/scrape":
          ext = format || "html";
          break;
      }

      const computedHash = await computeHash(params ?? "");
      const cacheUrl = `${env.CACHE_URL}/${computedHash}.${ext}`;
      console.log("Cache URL:", cacheUrl);

      // check if the file is in the cache
      const cacheResp = await fetch(cacheUrl, {method: "HEAD"});
      if (cacheResp.status === 200) {
        console.log("Cache hit for", cacheUrl);

        // if found, return the cached response
        return fetch(cacheUrl);
      }
    }

    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      ...(request.method === "POST" ? {body: bufferedBody} : {}),
    });

    return fetch(newRequest);
  },
} satisfies ExportedHandler<Env>;

async function computeHash(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  // Convert ArrayBuffer to Buffer for compatibility with Node.js Buffer API
  // and get hex digest like createHash("sha256").update(str).digest("hex")
  return Array.from(new Uint8Array(digest))
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}
