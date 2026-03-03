const https = require("https");
const http  = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {

  // CORS — allow any origin
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, anthropic-version");

  // Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check — GET /
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "DFC proxy is running" }));
    return;
  }

  // Only allow POST /v1/messages
  if (req.method !== "POST" || req.url !== "/v1/messages") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /v1/messages" }));
    return;
  }

  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {

    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing x-api-key header" }));
      return;
    }

    const bodyBuf = Buffer.from(body);

    const options = {
      hostname: "api.anthropic.com",
      path:     "/v1/messages",
      method:   "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Length":    bodyBuf.length
      }
    };

    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      });
      proxyRes.pipe(res);
    });

    proxyReq.on("error", e => {
      console.error("Proxy error:", e.message);
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Proxy error: " + e.message }));
    });

    proxyReq.write(bodyBuf);
    proxyReq.end();
  });

}).listen(PORT, () => {
  console.log(`DFC proxy running on port ${PORT}`);
});
