# FitBuddy AI – Landing + Chat Demo

A modern landing page and interactive chat demo for showcasing FitBuddy AI. The demo supports two modes:
- Simulation (default): fast, local mock replies for instant UX.
- Webhook: forwards messages to your webhook via a local proxy server to avoid CORS issues.

## Quick Start

Option A – Open static demo (simulation mode works out of the box):
1. Open `public/index.html` in your browser, or use VS Code “Live Server”.
2. Toggle on “Send via webhook” to attempt direct webhook calls (may be blocked by CORS).

Option B – Run with local proxy (recommended for webhook):
```bash
# From the project root
npm install
npm start
```
Then open:
- http://localhost:3000 (site)
- The chat demo will call `/api/chat`, which proxies to your webhook.

## Configure Webhook
- Default webhook is set to the provided URL in `server.js`.
- To override: set an environment variable and restart the server.
```bash
# PowerShell (Windows)
$env:WEBHOOK_URL="https://your.webhook/url"; npm start
```

## Project Structure
- `public/` – Static frontend (HTML/CSS/JS, images)
- `server.js` – Express server + `/api/chat` proxy
- `package.json` – Dependencies and start script

## Deploy
- Static-only: Deploy `public/` to any static host (simulation mode only, or direct webhook if CORS allows).
- With proxy: Deploy the Node server (e.g., Render/Heroku/VPS) and serve `public/` plus `/api/chat`.

## Notes
- The demo extracts the response from the webhook by looking for `text` or `message` fields; otherwise, it displays raw text or JSON.
- If the webhook returns non-JSON, the proxy passes text through.
