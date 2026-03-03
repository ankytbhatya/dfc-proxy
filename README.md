# DFC Map — Anthropic API Proxy

Tiny Node.js proxy to forward requests to Anthropic's API, adding CORS headers so the map works from a browser.

## Deploy to Render (free)

1. Push this folder to a GitHub repo (e.g. `dfc-proxy`)
2. Go to render.com → New → Web Service → connect your repo
3. Settings:
   - Build command: (leave blank)
   - Start command: `node server.js`
   - Instance type: Free
4. Click Deploy
5. Your proxy URL will be: https://your-service-name.onrender.com

## Then update your map

In index.html, change the fetch URL from:
  https://api.anthropic.com/v1/messages
to:
  https://your-service-name.onrender.com/v1/messages
