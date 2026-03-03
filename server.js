const https = require("https");
const http  = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {

  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "DFC proxy is running" }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/v1/messages") {
    res.writeHead(404); res.end("Not found"); return;
  }

  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) { res.writeHead(400); res.end("Missing x-api-key"); return; }
    const bodyBuf = Buffer.from(body);
    const opts = {
      hostname: "api.anthropic.com", path: "/v1/messages", method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Length": bodyBuf.length }
    };
    const pr = https.request(opts, r => { res.writeHead(r.statusCode, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }); r.pipe(res); });
    pr.on("error", e => { res.writeHead(502); res.end(e.message); });
    pr.write(bodyBuf); pr.end();
  });

}).listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
